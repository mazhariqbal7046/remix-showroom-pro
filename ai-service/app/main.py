from __future__ import annotations

import asyncio
import os
from datetime import date, datetime, timedelta, timezone
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()


class AskRequest(BaseModel):
    question: str = Field(min_length=2, max_length=1000)


class NotificationRequest(BaseModel):
    event_type: str = Field(min_length=2, max_length=80)
    destination: str = Field(min_length=3, max_length=320)
    subject: str = Field(min_length=2, max_length=160)
    body: str = Field(min_length=2, max_length=10000)
    recipient_type: str = Field(default="owner", pattern="^(owner|customer|partner)$")
    recipient_id: str | None = None


class MonthlyClosingRequest(BaseModel):
    month_start: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    notes: str | None = None


class BankTransferRequest(BaseModel):
    transfer_reference: str = Field(min_length=3, max_length=120)
    transfer_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")


class PlatformPaymentSettingsRequest(BaseModel):
    account_holder: str = Field(min_length=2, max_length=120)
    bank_name: str = Field(min_length=2, max_length=120)
    account_number: str = Field(min_length=5, max_length=80)
    iban: str = Field(default="", max_length=50)
    raast_id: str = Field(default="", max_length=120)
    payment_instructions: str = Field(default="", max_length=1000)


class PaymentReviewRequest(BaseModel):
    decision: str = Field(pattern="^(approve|reject)$")
    note: str | None = Field(default=None, max_length=500)


SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "Showroom Pro <onboarding@resend.dev>")
NOTIFICATION_WORKER_ENABLED = os.getenv("NOTIFICATION_WORKER_ENABLED", "true").lower() == "true"
WORKER_SECRET = os.getenv("WORKER_SECRET", "")
ADMIN_API_SECRET = os.getenv("ADMIN_API_SECRET", "")
SUPER_ADMIN_EMAIL = os.getenv("SUPER_ADMIN_EMAIL", "mazhariqbal4016@gmail.com").strip().lower()

app = FastAPI(title="Showroom Pro AI API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CLIENT_ORIGIN", "http://localhost:5173").split(","), allow_methods=["*"], allow_headers=["*"])


async def supabase_rows(table: str, params: dict[str, str]) -> list[dict[str, Any]]:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return []
    headers = {"apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"}
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(f"{SUPABASE_URL}/rest/v1/{table}", params=params, headers=headers)
    if response.is_error:
        raise HTTPException(502, f"Supabase query failed for {table}.")
    return response.json()


async def verify_user(token: str) -> str | None:
    if not SUPABASE_URL or not token:
        return None
    headers = {"apikey": SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(f"{SUPABASE_URL}/auth/v1/user", headers=headers)
    return response.json().get("id") if response.is_success else None


async def verify_super_admin(token: str) -> bool:
    if not SUPABASE_URL or not token:
        return False
    headers = {"apikey": SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(f"{SUPABASE_URL}/auth/v1/user", headers=headers)
    if not response.is_success:
        return False
    user = response.json()
    return (
        str(user.get("email", "")).strip().lower() == SUPER_ADMIN_EMAIL
        and user.get("app_metadata", {}).get("role") == "super_admin"
    )


async def allowed(showroom_id: str, user_id: str) -> bool:
    rows = await supabase_rows("showroom_members", {"showroom_id": f"eq.{showroom_id}", "user_id": f"eq.{user_id}", "select": "showroom_id"})
    return bool(rows)


async def showroom_owner(showroom_id: str, user_id: str) -> bool:
    rows = await supabase_rows("showroom_members", {"showroom_id": f"eq.{showroom_id}", "user_id": f"eq.{user_id}", "select": "role"})
    return any(str(row.get("role", "")).lower() in {"owner", "admin"} for row in rows)


async def authenticated_user(authorization: str | None) -> str:
    token = (authorization or "").removeprefix("Bearer ").strip()
    user_id = await verify_user(token)
    if not user_id:
        raise HTTPException(401, "Please sign in again.")
    return user_id


async def require_admin(authorization: str | None) -> str:
    token = (authorization or "").removeprefix("Bearer ").strip()
    if not await verify_super_admin(token):
        raise HTTPException(403, "Admin access denied.")
    user_id = await verify_user(token)
    if not user_id:
        raise HTTPException(401, "Please sign in again.")
    return user_id


def add_billing_month(value: date) -> date:
    month_index = value.month
    year = value.year + (month_index // 12)
    month = month_index % 12 + 1
    next_month_start = date(year, month, 1)
    following = next_month_start.replace(day=28) + timedelta(days=4)
    last_day = (following - timedelta(days=following.day)).day
    return date(year, month, min(value.day, last_day))


async def supabase_write(table: str, payload: dict[str, Any], params: dict[str, str] | None = None, method: str = "POST") -> dict[str, Any]:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(503, "Supabase service is not configured.")
    headers = {"apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}", "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=representation" if params and params.get("on_conflict") else "return=representation"}
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.request(method, f"{SUPABASE_URL}/rest/v1/{table}", params=params or {}, headers=headers, json=payload)
    if response.is_error:
        raise HTTPException(502, f"Supabase write failed for {table}.")
    data = response.json()
    return data[0] if isinstance(data, list) and data else (data if isinstance(data, dict) else {})


async def send_email(to: str, subject: str, body: str) -> None:
    if not RESEND_API_KEY:
        raise RuntimeError("RESEND_API_KEY is not configured.")
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post("https://api.resend.com/emails", headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"}, json={"from": EMAIL_FROM, "to": [to], "subject": subject, "text": body})
    if response.is_error:
        raise RuntimeError(f"Resend rejected email: {response.text[:200]}")


async def process_email_queue() -> int:
    if not RESEND_API_KEY:
        return 0
    queued = await supabase_rows("notification_deliveries", {"status": "eq.queued", "channel": "eq.email", "scheduled_for": "lte.now()", "order": "created_at.asc", "limit": "25"})
    sent = 0
    for item in queued:
        payload = item.get("payload") or {}
        try:
            await send_email(item["destination"], payload.get("subject", item["event_type"]), payload.get("body", "Showroom Pro notification"))
            await supabase_write("notification_deliveries", {"status": "sent", "sent_at": datetime.now(timezone.utc).isoformat()}, {"id": f"eq.{item['id']}"}, "PATCH")
            sent += 1
        except Exception as error:
            await supabase_write("notification_deliveries", {"status": "failed", "error_message": str(error)[:500]}, {"id": f"eq.{item['id']}"}, "PATCH")
    return sent


async def notification_worker() -> None:
    while True:
        try:
            await process_email_queue()
        except Exception:
            pass
        await asyncio.sleep(60)


worker_task: asyncio.Task | None = None


@app.on_event("startup")
async def start_notification_worker() -> None:
    global worker_task
    if NOTIFICATION_WORKER_ENABLED:
        worker_task = asyncio.create_task(notification_worker())


@app.on_event("shutdown")
async def stop_notification_worker() -> None:
    if worker_task:
        worker_task.cancel()


def amount(row: dict[str, Any], key: str) -> float:
    try:
        return float(row.get(key) or 0)
    except (TypeError, ValueError):
        return 0.0


async def snapshot(showroom_id: str) -> dict[str, Any]:
    sales, expenses, bookings, inventory = await asyncio.gather(
        supabase_rows("sales", {"showroom_id": f"eq.{showroom_id}", "select": "total,cost_of_goods,status"}),
        supabase_rows("expenses", {"showroom_id": f"eq.{showroom_id}", "select": "amount"}),
        supabase_rows("bookings", {"showroom_id": f"eq.{showroom_id}", "select": "total_price,status"}),
        supabase_rows("inventory_units", {"showroom_id": f"eq.{showroom_id}", "select": "status,quantity"}),
    )
    active_sales = [x for x in sales if str(x.get("status", "")).lower() not in {"cancelled", "canceled"}]
    revenue = sum(amount(x, "total") for x in active_sales)
    cogs = sum(amount(x, "cost_of_goods") for x in active_sales)
    operating_expenses = sum(amount(x, "amount") for x in expenses)
    return {"revenue": revenue, "cogs": cogs, "gross_profit": revenue - cogs, "expenses": operating_expenses, "net_profit": revenue - cogs - operating_expenses, "active_bookings": sum(str(x.get("status", "")).lower() not in {"cancelled", "delivered"} for x in bookings), "inventory_units": sum(int(x.get("quantity") or 0) for x in inventory)}


def fallback(question: str, data: dict[str, Any]) -> str:
    q = question.lower()
    if any(x in q for x in ("profit", "munafa", "منافع")):
        return f"Net profit PKR {data['net_profit']:,.0f}; gross profit PKR {data['gross_profit']:,.0f}; COGS PKR {data['cogs']:,.0f}; expenses PKR {data['expenses']:,.0f}."
    if any(x in q for x in ("stock", "inventory", "bike")):
        return f"Recorded inventory quantity is {data['inventory_units']} units. Confirm reserved units before promising delivery."
    if any(x in q for x in ("booking", "reservation")):
        return f"There are {data['active_bookings']} active bookings. Booking deposits are not counted as sales revenue."
    return f"Revenue PKR {data['revenue']:,.0f}, net profit PKR {data['net_profit']:,.0f}, active bookings {data['active_bookings']}, inventory {data['inventory_units']} units."


async def model_answer(question: str, data: dict[str, Any]) -> str | None:
    key = os.getenv("AI_API_KEY")
    if not key:
        return None
    base = os.getenv("AI_API_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    body = {"model": os.getenv("AI_MODEL", "gpt-4o-mini"), "temperature": 0.2, "messages": [{"role": "system", "content": "You are a careful EV showroom assistant. Use only the supplied figures. Never invent records. Answer briefly in the user's language."}, {"role": "user", "content": f"Figures: {data}\nQuestion: {question}"}]}
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(f"{base}/chat/completions", headers={"Authorization": f"Bearer {key}"}, json=body)
    if response.is_error:
        return None
    return response.json().get("choices", [{}])[0].get("message", {}).get("content")


@app.get("/health")
async def health() -> dict[str, Any]:
    return {"ok": True, "service": "showroom-pro-ai", "supabase_configured": bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY), "ai_configured": bool(os.getenv("AI_API_KEY")), "email_configured": bool(RESEND_API_KEY), "email_worker_enabled": NOTIFICATION_WORKER_ENABLED}


@app.get("/")
async def root() -> dict[str, Any]:
    return {"ok": True, "service": "showroom-pro-ai", "message": "Showroom Pro backend is running. Use /health for status."}


@app.post("/api/notifications/queue")
async def queue_notification(request: NotificationRequest, authorization: str | None = Header(default=None), x_showroom_id: str | None = Header(default=None)) -> dict[str, Any]:
    if not x_showroom_id:
        raise HTTPException(400, "x-showroom-id is required.")
    token = (authorization or "").removeprefix("Bearer ").strip()
    user_id = await verify_user(token)
    if not user_id or not await allowed(x_showroom_id, user_id):
        raise HTTPException(403, "Showroom access denied.")
    row = await supabase_write("notification_deliveries", {"showroom_id": x_showroom_id, "recipient_type": request.recipient_type, "recipient_id": request.recipient_id, "channel": "email", "event_type": request.event_type, "destination": request.destination, "payload": {"subject": request.subject, "body": request.body}})
    return {"queued": True, "notification": row}


@app.post("/api/notifications/process")
async def process_notifications(x_worker_secret: str | None = Header(default=None)) -> dict[str, Any]:
    if not WORKER_SECRET or x_worker_secret != WORKER_SECRET:
        raise HTTPException(403, "Worker access denied.")
    return {"processed": await process_email_queue()}


@app.post("/api/reports/monthly-closing")
async def monthly_closing(request: MonthlyClosingRequest, authorization: str | None = Header(default=None), x_showroom_id: str | None = Header(default=None)) -> dict[str, Any]:
    if not x_showroom_id:
        raise HTTPException(400, "x-showroom-id is required.")
    token = (authorization or "").removeprefix("Bearer ").strip()
    user_id = await verify_user(token)
    if not user_id or not await allowed(x_showroom_id, user_id):
        raise HTTPException(403, "Showroom access denied.")
    data = await snapshot(x_showroom_id)
    row = await supabase_write("monthly_closings", {"showroom_id": x_showroom_id, "month_start": request.month_start, "closed_at": datetime.now(timezone.utc).isoformat(), "closed_by": user_id, "revenue": data["revenue"], "cogs": data["cogs"], "gross_profit": data["gross_profit"], "operating_expenses": data["expenses"], "net_profit": data["net_profit"], "stock_units": data["inventory_units"], "notes": request.notes}, {"on_conflict": "showroom_id,month_start"})
    return {"saved": True, "closing": row, "figures": data}


@app.get("/api/admin/metrics")
async def admin_metrics(x_admin_secret: str | None = Header(default=None), authorization: str | None = Header(default=None)) -> dict[str, Any]:
    token = (authorization or "").removeprefix("Bearer ").strip()
    if not ((ADMIN_API_SECRET and x_admin_secret == ADMIN_API_SECRET) or await verify_super_admin(token)):
        raise HTTPException(403, "Admin access denied.")
    showrooms, subscriptions, memberships, inventory, sales, bookings = await asyncio.gather(
        supabase_rows("showrooms", {"select": "id,created_at"}),
        supabase_rows("subscriptions", {"select": "status,monthly_amount"}),
        supabase_rows("showroom_members", {"select": "user_id"}),
        supabase_rows("inventory_units", {"select": "quantity"}),
        supabase_rows("sales", {"select": "total,status"}),
        supabase_rows("bookings", {"select": "status"}),
    )
    active_sales = [item for item in sales if str(item.get("status", "")).lower() not in {"cancelled", "canceled"}]
    return {
        "signup_count": len(showrooms),
        "active_showrooms": sum(1 for item in subscriptions if item.get("status") in {"active", "trial"}),
        "trial_count": sum(1 for item in subscriptions if item.get("status") == "trial"),
        "active_subscription_count": sum(1 for item in subscriptions if item.get("status") == "active"),
        "subscription_count": len(subscriptions),
        "mrr": sum(amount(item, "monthly_amount") for item in subscriptions if item.get("status") == "active"),
        "member_count": len(memberships),
        "inventory_units": sum(int(item.get("quantity") or 0) for item in inventory),
        "recorded_sales": len(active_sales),
        "sales_volume": sum(amount(item, "total") for item in active_sales),
        "active_bookings": sum(1 for item in bookings if str(item.get("status", "")).lower() not in {"cancelled", "delivered"}),
    }


@app.get("/api/billing/subscription")
async def billing_subscription(authorization: str | None = Header(default=None), x_showroom_id: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = await authenticated_user(authorization)
    if not x_showroom_id or not await allowed(x_showroom_id, user_id):
        raise HTTPException(403, "Showroom access denied.")
    subscriptions = await supabase_rows("subscriptions", {"showroom_id": f"eq.{x_showroom_id}", "status": "in.(trial,active,past_due)", "select": "id,status,monthly_amount,next_billing_date,last_paid_at,provider_reference", "limit": "1"})
    if not subscriptions:
        raise HTTPException(404, "No current subscription was found for this showroom.")
    settings = await supabase_rows("platform_payment_settings", {"select": "account_holder,bank_name,account_number,iban,raast_id,payment_instructions", "limit": "1"})
    payments = await supabase_rows("subscription_payment_submissions", {"showroom_id": f"eq.{x_showroom_id}", "select": "id,amount,currency,transfer_reference,transfer_date,status,created_at,review_note", "order": "created_at.desc", "limit": "30"})
    return {"subscription": subscriptions[0], "payment_details": settings[0] if settings else None, "payments": payments}


@app.post("/api/billing/subscription-payments")
async def submit_subscription_payment(request: BankTransferRequest, authorization: str | None = Header(default=None), x_showroom_id: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = await authenticated_user(authorization)
    if not x_showroom_id or not await showroom_owner(x_showroom_id, user_id):
        raise HTTPException(403, "Only the showroom owner can submit a subscription payment.")
    try:
        date.fromisoformat(request.transfer_date)
    except ValueError:
        raise HTTPException(400, "Transfer date is invalid.")
    subscriptions = await supabase_rows("subscriptions", {"showroom_id": f"eq.{x_showroom_id}", "status": "in.(trial,active,past_due)", "select": "id,monthly_amount", "limit": "1"})
    if not subscriptions:
        raise HTTPException(404, "No current subscription was found.")
    settings = await supabase_rows("platform_payment_settings", {"select": "id", "limit": "1"})
    if not settings:
        raise HTTPException(409, "Platform bank transfer details have not been configured yet.")
    row = await supabase_write("subscription_payment_submissions", {
        "showroom_id": x_showroom_id,
        "subscription_id": subscriptions[0]["id"],
        "amount": subscriptions[0].get("monthly_amount") or 10000,
        "currency": "PKR",
        "transfer_reference": request.transfer_reference.strip(),
        "transfer_date": request.transfer_date,
        "submitted_by": user_id,
    })
    return {"submitted": True, "payment": row}


@app.get("/api/admin/payment-settings")
async def admin_get_payment_settings(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    await require_admin(authorization)
    rows = await supabase_rows("platform_payment_settings", {"select": "account_holder,bank_name,account_number,iban,raast_id,payment_instructions,updated_at", "limit": "1"})
    return {"settings": rows[0] if rows else None}


@app.put("/api/admin/payment-settings")
async def admin_update_payment_settings(request: PlatformPaymentSettingsRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = await require_admin(authorization)
    settings = request.model_dump()
    settings.update({"id": True, "updated_at": datetime.now(timezone.utc).isoformat(), "updated_by": user_id})
    row = await supabase_write("platform_payment_settings", settings, {"on_conflict": "id"})
    return {"saved": True, "settings": row}


@app.get("/api/admin/subscription-payments")
async def admin_subscription_payments(authorization: str | None = Header(default=None), status: str | None = None) -> dict[str, Any]:
    await require_admin(authorization)
    params = {"select": "id,showroom_id,subscription_id,amount,currency,transfer_reference,transfer_date,status,created_at,review_note", "order": "created_at.desc", "limit": "250"}
    if status in {"pending_review", "approved", "rejected"}:
        params["status"] = f"eq.{status}"
    payments, showrooms = await asyncio.gather(supabase_rows("subscription_payment_submissions", params), supabase_rows("showrooms", {"select": "id,name,email"}))
    showroom_map = {row["id"]: row for row in showrooms}
    return {"payments": [{**row, "showroom": showroom_map.get(row["showroom_id"], {})} for row in payments]}


@app.post("/api/admin/subscription-payments/{payment_id}/review")
async def admin_review_subscription_payment(payment_id: str, request: PaymentReviewRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    reviewer_id = await require_admin(authorization)
    rows = await supabase_rows("subscription_payment_submissions", {"id": f"eq.{payment_id}", "select": "id,showroom_id,subscription_id,status,transfer_reference", "limit": "1"})
    if not rows:
        raise HTTPException(404, "Payment submission not found.")
    payment = rows[0]
    if payment["status"] != "pending_review":
        raise HTTPException(409, "This payment has already been reviewed.")
    decision_status = "approved" if request.decision == "approve" else "rejected"
    reviewed_at = datetime.now(timezone.utc)
    reviewed = await supabase_write("subscription_payment_submissions", {"status": decision_status, "reviewed_at": reviewed_at.isoformat(), "reviewed_by": reviewer_id, "review_note": request.note}, {"id": f"eq.{payment_id}", "status": "eq.pending_review"}, "PATCH")
    if request.decision == "approve":
        current = await supabase_rows("subscriptions", {"id": f"eq.{payment['subscription_id']}", "select": "id,next_billing_date", "limit": "1"})
        next_base = date.fromisoformat(current[0]["next_billing_date"]) if current and current[0].get("next_billing_date") else reviewed_at.date()
        next_billing = add_billing_month(max(next_base, reviewed_at.date()))
        await supabase_write("subscriptions", {"status": "active", "provider": "bank_transfer", "provider_reference": payment["transfer_reference"], "last_paid_at": reviewed_at.isoformat(), "next_billing_date": next_billing.isoformat()}, {"id": f"eq.{payment['subscription_id']}"}, "PATCH")
    return {"reviewed": True, "payment": reviewed, "subscription_activated": request.decision == "approve"}


@app.get("/api/admin/showrooms")
async def admin_showrooms(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    token = (authorization or "").removeprefix("Bearer ").strip()
    if not await verify_super_admin(token):
        raise HTTPException(403, "Admin access denied.")
    showrooms, subscriptions, partners = await asyncio.gather(
        supabase_rows("showrooms", {"select": "id,name,category,email,phone,city,country,created_at", "order": "created_at.desc"}),
        supabase_rows("subscriptions", {"select": "showroom_id,plan_id,status,monthly_amount,started_at,next_billing_date"}),
        supabase_rows("partners", {"select": "showroom_id,status"}),
    )
    subscription_by_showroom = {row["showroom_id"]: row for row in subscriptions}
    partner_counts: dict[str, int] = {}
    for partner in partners:
        if partner.get("status", "Active") == "Active":
            key = partner.get("showroom_id")
            partner_counts[key] = partner_counts.get(key, 0) + 1
    return {"showrooms": [
        {
            **row,
            "subscription": subscription_by_showroom.get(row["id"]),
            "active_partners": partner_counts.get(row["id"], 0),
        }
        for row in showrooms
    ]}


@app.post("/api/ai/ask")
async def ask(request: AskRequest, authorization: str | None = Header(default=None), x_showroom_id: str | None = Header(default=None)) -> dict[str, Any]:
    if not x_showroom_id:
        raise HTTPException(400, "x-showroom-id is required.")
    token = (authorization or "").removeprefix("Bearer ").strip()
    user_id = await verify_user(token)
    if not user_id or not await allowed(x_showroom_id, user_id):
        raise HTTPException(403, "Showroom access denied.")
    data = await snapshot(x_showroom_id)
    generated = await model_answer(request.question, data)
    return {"answer": generated or fallback(request.question, data), "source": "ai" if generated else "verified-fallback", "data": data}
