from __future__ import annotations

import asyncio
import hashlib
import os
import secrets
from datetime import date, datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo

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


class PartnerInvitationRequest(BaseModel):
    partner_id: str = Field(min_length=36, max_length=36)


class PartnerInvitationAcceptRequest(BaseModel):
    token: str = Field(min_length=32, max_length=200)


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
    chunk_size = min(1000, max(1, int(params.get("limit", "100000"))))
    headers = {"apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}", "Range-Unit": "items"}
    rows: list[dict[str, Any]] = []
    async with httpx.AsyncClient(timeout=15) as client:
        offset = 0
        while offset < int(params.get("limit", "100000")):
            page_headers = {**headers, "Range": f"{offset}-{offset + chunk_size - 1}"}
            response = await client.get(f"{SUPABASE_URL}/rest/v1/{table}", params=params, headers=page_headers)
            if response.is_error:
                raise HTTPException(502, f"Supabase query failed for {table}.")
            page = response.json()
            rows.extend(page)
            if len(page) < chunk_size:
                break
            offset += len(page)
    return rows


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


async def showroom_operator(showroom_id: str, user_id: str) -> bool:
    rows = await supabase_rows("showroom_members", {"showroom_id": f"eq.{showroom_id}", "user_id": f"eq.{user_id}", "select": "role"})
    return any(str(row.get("role", "")).lower() in {"owner", "admin", "manager", "salesperson", "accountant"} for row in rows)


async def authenticated_user(authorization: str | None) -> str:
    token = (authorization or "").removeprefix("Bearer ").strip()
    user_id = await verify_user(token)
    if not user_id:
        raise HTTPException(401, "Please sign in again.")
    return user_id


async def authenticated_user_details(authorization: str | None) -> dict[str, Any]:
    token = (authorization or "").removeprefix("Bearer ").strip()
    user_id = await verify_user(token)
    if not user_id:
        raise HTTPException(401, "Please sign in again.")
    headers = {"apikey": SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(f"{SUPABASE_URL}/auth/v1/user", headers=headers)
    if not response.is_success:
        raise HTTPException(401, "Please sign in again.")
    return response.json()


async def require_admin(authorization: str | None) -> str:
    token = (authorization or "").removeprefix("Bearer ").strip()
    if not await verify_super_admin(token):
        raise HTTPException(403, "Admin access denied.")
    user_id = await verify_user(token)
    if not user_id:
        raise HTTPException(401, "Please sign in again.")
    return user_id


async def log_admin_action(actor_id: str, event_type: str, target_type: str, target_id: str | None, details: dict[str, Any] | None = None) -> None:
    try:
        await supabase_write("platform_activity_logs", {"actor_id": actor_id, "event_type": event_type, "target_type": target_type, "target_id": target_id, "details": details or {}})
    except Exception:
        # The requested change must not be reported as failed only because its
        # separate audit entry could not be recorded.
        return


async def supabase_auth_user_count() -> int:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(503, "Supabase service is not configured.")
    headers = {"apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}"}
    page, count = 1, 0
    async with httpx.AsyncClient(timeout=20) as client:
        while True:
            response = await client.get(f"{SUPABASE_URL}/auth/v1/admin/users", params={"page": page, "per_page": 1000}, headers=headers)
            if response.is_error:
                raise HTTPException(502, "Supabase Auth user count could not be loaded.")
            payload = response.json()
            users = payload.get("users", []) if isinstance(payload, dict) else payload
            count += len(users)
            if len(users) < 1000:
                return count
            page += 1


def add_billing_month(value: date) -> date:
    month_index = value.month
    year = value.year + (month_index // 12)
    month = month_index % 12 + 1
    next_month_start = date(year, month, 1)
    following = next_month_start.replace(day=28) + timedelta(days=4)
    last_day = (following - timedelta(days=following.day)).day
    return date(year, month, min(value.day, last_day))


async def supabase_write(table: str, payload: dict[str, Any], params: dict[str, str] | None = None, method: str = "POST", prefer: str | None = None) -> dict[str, Any]:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(503, "Supabase service is not configured.")
    headers = {"apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}", "Content-Type": "application/json", "Prefer": prefer or ("resolution=merge-duplicates,return=representation" if params and params.get("on_conflict") else "return=representation")}
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
            await run_scheduled_email_jobs()
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


async def snapshot(showroom_id: str, period_start: date | None = None, period_end: date | None = None) -> dict[str, Any]:
    sales_params = {"showroom_id": f"eq.{showroom_id}", "select": "id,total,cost_of_goods,status,booking_id,date"}
    expense_params = {"showroom_id": f"eq.{showroom_id}", "select": "amount,expense_date"}
    if period_start:
        sales_params["date"] = f"gte.{period_start.isoformat()}"
        expense_params["expense_date"] = f"gte.{period_start.isoformat()}"
    sales, expenses, bookings, inventory = await asyncio.gather(
        supabase_rows("sales", sales_params),
        supabase_rows("expenses", expense_params),
        supabase_rows("bookings", {"showroom_id": f"eq.{showroom_id}", "select": "id,total_price,cost_of_goods,status,delivery_date,booking_date"}),
        supabase_rows("inventory_units", {"showroom_id": f"eq.{showroom_id}", "select": "id,quantity,purchase_cost"}),
    )
    if period_end:
        sales = [row for row in sales if str(row.get("date") or "") < period_end.isoformat()]
        expenses = [row for row in expenses if str(row.get("expense_date") or "") < period_end.isoformat()]
    active_sales = [x for x in sales if str(x.get("status", "")).lower() not in {"cancelled", "canceled"}]
    invoiced_booking_ids = {x.get("booking_id") for x in active_sales if x.get("booking_id")}
    delivered_bookings = [b for b in bookings if b.get("status") == "Delivered" and b.get("id") not in invoiced_booking_ids and (not period_start or (b.get("delivery_date") or b.get("booking_date") or "") >= period_start.isoformat()) and (not period_end or (b.get("delivery_date") or b.get("booking_date") or "") < period_end.isoformat())]
    revenue = sum(amount(x, "total") for x in active_sales) + sum(amount(x, "total_price") for x in delivered_bookings)
    sales_costs = sum(amount(x, "cost_of_goods") for x in active_sales)
    if any(amount(x, "cost_of_goods") <= 0 for x in active_sales):
        missing_cost_sales = [x["id"] for x in active_sales if amount(x, "cost_of_goods") <= 0]
        if missing_cost_sales:
            line_items, units = await asyncio.gather(
                supabase_rows("sale_items", {"select": "sale_id,inventory_id,quantity,unit_cost", "sale_id": f"in.({','.join(missing_cost_sales)})", "limit": "5000"}),
                supabase_rows("inventory_units", {"showroom_id": f"eq.{showroom_id}", "select": "id,purchase_cost"}),
            )
            unit_costs = {unit["id"]: amount(unit, "purchase_cost") for unit in units}
            item_costs = {sale_id: 0.0 for sale_id in missing_cost_sales}
            for item in line_items:
                item_costs[item["sale_id"]] += amount(item, "quantity") * (amount(item, "unit_cost") or unit_costs.get(item.get("inventory_id"), 0))
            sales_costs = sum(amount(sale, "cost_of_goods") if amount(sale, "cost_of_goods") > 0 else item_costs.get(sale["id"], 0) for sale in active_sales)
    cogs = sales_costs + sum(amount(x, "cost_of_goods") for x in delivered_bookings)
    operating_expenses = sum(amount(x, "amount") for x in expenses)
    return {"revenue": revenue, "cogs": cogs, "gross_profit": revenue - cogs, "expenses": operating_expenses, "net_profit": revenue - cogs - operating_expenses, "active_bookings": sum(str(x.get("status", "")).lower() not in {"cancelled", "delivered"} for x in bookings), "inventory_units": sum(int(x.get("quantity") or 0) for x in inventory)}


async def scheduled_email(showroom_id: str, destination: str, event_type: str, subject: str, body: str, dedupe_key: str, recipient_type: str = "owner", recipient_id: str | None = None) -> None:
    await supabase_write("notification_deliveries", {
        "showroom_id": showroom_id,
        "recipient_type": recipient_type,
        "recipient_id": recipient_id,
        "channel": "email",
        "event_type": event_type,
        "destination": destination,
        "payload": {"subject": subject, "body": body},
        "dedupe_key": dedupe_key,
    }, {"on_conflict": "dedupe_key"}, prefer="resolution=ignore-duplicates,return=representation")


async def begin_scheduled_run(showroom_id: str, job_type: str, business_date: date) -> str | None:
    filters = {"showroom_id": f"eq.{showroom_id}", "job_type": f"eq.{job_type}", "business_date": f"eq.{business_date.isoformat()}", "select": "id,status", "limit": "1"}
    rows = await supabase_rows("scheduled_notification_runs", filters)
    if rows:
        if rows[0].get("status") != "failed":
            return None
        await supabase_write("scheduled_notification_runs", {"status": "processing", "error_message": None}, {"id": f"eq.{rows[0]['id']}"}, "PATCH")
        return rows[0]["id"]
    row = await supabase_write("scheduled_notification_runs", {"showroom_id": showroom_id, "job_type": job_type, "business_date": business_date.isoformat(), "status": "processing"})
    return row.get("id")


async def finish_scheduled_run(run_id: str, error: Exception | None = None) -> None:
    await supabase_write("scheduled_notification_runs", {
        "status": "failed" if error else "completed",
        "error_message": str(error)[:500] if error else None,
        "completed_at": datetime.now(timezone.utc).isoformat() if not error else None,
    }, {"id": f"eq.{run_id}"}, "PATCH")


async def run_scheduled_email_jobs() -> None:
    now = datetime.now(ZoneInfo("Asia/Karachi"))
    today = now.date()
    last_day_of_month = (today + timedelta(days=1)).month != today.month
    first_day_of_month = today.day == 1
    jobs: list[tuple[str, date]] = []
    if now.hour == 20:
        jobs.append(("daily_showroom_report", today))
    if now.hour == 18 and last_day_of_month:
        jobs.append(("monthly_closing_reminder", today))
    if now.hour == 9 and first_day_of_month:
        jobs.append(("partner_monthly_profit", today))
    if not jobs:
        return
    showrooms = await supabase_rows("showrooms", {"select": "id,name,email", "order": "created_at.asc"})
    for job_type, business_date in jobs:
        for showroom in showrooms:
            if not showroom.get("email") and job_type != "partner_monthly_profit":
                continue
            run_id = await begin_scheduled_run(showroom["id"], job_type, business_date)
            if not run_id:
                continue
            try:
                if job_type == "daily_showroom_report":
                    summary = await snapshot(showroom["id"], today, today + timedelta(days=1))
                    body = (f"Daily showroom report for {today.isoformat()} — {showroom.get('name') or 'Showroom'}\n"
                            f"Revenue: PKR {summary['revenue']:,.0f}\nCOGS: PKR {summary['cogs']:,.0f}\n"
                            f"Gross profit: PKR {summary['gross_profit']:,.0f}\nExpenses: PKR {summary['expenses']:,.0f}\n"
                            f"Net profit: PKR {summary['net_profit']:,.0f}\nActive bookings: {summary['active_bookings']}\n"
                            f"Current stock units: {summary['inventory_units']}")
                    await scheduled_email(showroom["id"], showroom["email"], job_type, f"Daily showroom report — {today.isoformat()}", body, f"{job_type}:{showroom['id']}:{today.isoformat()}")
                elif job_type == "monthly_closing_reminder":
                    body = (f"Today is the final day of {today.strftime('%B %Y')}. Please review today's sales, delivered bookings, COGS, expenses, and stock, then use Close Month in Showroom Pro Business Reports.")
                    await scheduled_email(showroom["id"], showroom["email"], job_type, f"Monthly closing reminder — {today.strftime('%B %Y')}", body, f"{job_type}:{showroom['id']}:{today.isoformat()}")
                else:
                    month_end = today.replace(day=1)
                    previous_day = month_end - timedelta(days=1)
                    month_start = previous_day.replace(day=1)
                    summary = await snapshot(showroom["id"], month_start, month_end)
                    partners, allocation_rows = await asyncio.gather(
                        supabase_rows("partners", {"showroom_id": f"eq.{showroom['id']}", "select": "id,full_name,email,profit_sharing_percentage,status"}),
                        supabase_rows("partner_allocations", {"showroom_id": f"eq.{showroom['id']}", "allocation_type": "eq.profit_sharing", "status": "eq.Approved", "effective_date": f"lte.{previous_day.isoformat()}", "select": "effective_date,allocations", "order": "effective_date.desc", "limit": "100"}),
                    )
                    allocation = allocation_rows[0].get("allocations", {}) if allocation_rows else {}
                    for partner in partners:
                        if not partner.get("email") or str(partner.get("status", "Active")).lower() != "active":
                            continue
                        share = float(allocation.get(partner["id"], partner.get("profit_sharing_percentage") or 0))
                        allocated = max(0.0, summary["net_profit"]) * share / 100
                        body = (f"Monthly partner statement for {month_start.strftime('%B %Y')}\n"
                                f"Showroom: {showroom.get('name') or 'Showroom'}\nProfit share: {share:g}%\n"
                                f"Showroom net profit: PKR {summary['net_profit']:,.0f}\nYour allocated profit: PKR {allocated:,.0f}\n"
                                "This is an allocation statement; check with the showroom owner for actual settlement status.")
                        await scheduled_email(showroom["id"], partner["email"], job_type, f"Partner profit statement — {month_start.strftime('%B %Y')}", body, f"{job_type}:{showroom['id']}:{partner['id']}:{month_start.isoformat()}", "partner", partner["id"])
                await finish_scheduled_run(run_id)
            except Exception as error:
                await finish_scheduled_run(run_id, error)


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
    if not user_id or not await showroom_operator(x_showroom_id, user_id):
        raise HTTPException(403, "Showroom access denied.")
    row = await supabase_write("notification_deliveries", {"showroom_id": x_showroom_id, "recipient_type": request.recipient_type, "recipient_id": request.recipient_id, "channel": "email", "event_type": request.event_type, "destination": request.destination, "payload": {"subject": request.subject, "body": request.body}})
    return {"queued": True, "notification": row}


def partner_invite_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@app.post("/api/partners/invitations")
async def create_partner_invitation(request: PartnerInvitationRequest, authorization: str | None = Header(default=None), x_showroom_id: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = await authenticated_user(authorization)
    if not x_showroom_id or not await showroom_owner(x_showroom_id, user_id):
        raise HTTPException(403, "Only the showroom owner can invite a partner login.")
    partners = await supabase_rows("partners", {"id": f"eq.{request.partner_id}", "showroom_id": f"eq.{x_showroom_id}", "select": "id,full_name,email,status", "limit": "1"})
    if not partners:
        raise HTTPException(404, "Partner record was not found.")
    partner = partners[0]
    if not partner.get("email"):
        raise HTTPException(400, "Add this partner's email address before sending a login invitation.")
    if str(partner.get("status", "Active")).lower() != "active":
        raise HTTPException(409, "Only active partners can be invited to sign in.")
    members = await supabase_rows("showroom_members", {"showroom_id": f"eq.{x_showroom_id}", "partner_id": f"eq.{request.partner_id}", "select": "user_id", "limit": "1"})
    if members:
        raise HTTPException(409, "This partner already has a linked login.")
    existing = await supabase_rows("partner_invitations", {"showroom_id": f"eq.{x_showroom_id}", "partner_id": f"eq.{request.partner_id}", "status": "eq.pending", "expires_at": f"gt.{datetime.now(timezone.utc).isoformat()}", "select": "id", "limit": "1"})
    if existing:
        await supabase_write("partner_invitations", {"status": "revoked"}, {"id": f"eq.{existing[0]['id']}", "status": "eq.pending"}, "PATCH")
    raw_token = secrets.token_urlsafe(40)
    expiry = datetime.now(timezone.utc) + timedelta(days=7)
    invitation = await supabase_write("partner_invitations", {"showroom_id": x_showroom_id, "partner_id": request.partner_id, "invite_email": partner["email"].strip().lower(), "token_hash": partner_invite_hash(raw_token), "expires_at": expiry.isoformat(), "created_by": user_id})
    showroom = await supabase_rows("showrooms", {"id": f"eq.{x_showroom_id}", "select": "name", "limit": "1"})
    invite_url = f"{CLIENT_ORIGIN.rstrip('/')}/partner-invite?token={raw_token}"
    body = (f"You have been invited to the {showroom[0].get('name') if showroom else 'showroom'} partner portal. "
            f"Use this secure link within 7 days: {invite_url}\n\n"
            f"Sign in or create a Showroom Pro account using {partner['email']}. The link only grants read-only access to your own partner record, investment history and settlements.")
    await supabase_write("notification_deliveries", {"showroom_id": x_showroom_id, "recipient_type": "partner", "recipient_id": request.partner_id, "channel": "email", "event_type": "partner_invitation", "destination": partner["email"], "payload": {"subject": "Showroom Pro partner portal invitation", "body": body}})
    return {"queued": True, "invitation_id": invitation.get("id"), "expires_at": expiry.isoformat()}


@app.get("/api/partners/invitations/{token}")
async def get_partner_invitation(token: str) -> dict[str, Any]:
    if len(token) < 32 or len(token) > 200:
        raise HTTPException(404, "This partner invitation is invalid or expired.")
    rows = await supabase_rows("partner_invitations", {"token_hash": f"eq.{partner_invite_hash(token)}", "status": "eq.pending", "select": "showroom_id,partner_id,invite_email,expires_at", "limit": "1"})
    if not rows or datetime.fromisoformat(rows[0]["expires_at"].replace("Z", "+00:00")) <= datetime.now(timezone.utc):
        raise HTTPException(410, "This partner invitation is invalid or expired.")
    partner, showroom = await asyncio.gather(
        supabase_rows("partners", {"id": f"eq.{rows[0]['partner_id']}", "showroom_id": f"eq.{rows[0]['showroom_id']}", "select": "full_name", "limit": "1"}),
        supabase_rows("showrooms", {"id": f"eq.{rows[0]['showroom_id']}", "select": "name", "limit": "1"}),
    )
    return {"email": rows[0]["invite_email"], "partner_name": partner[0].get("full_name") if partner else "Partner", "showroom_name": showroom[0].get("name") if showroom else "Showroom", "expires_at": rows[0]["expires_at"]}


@app.post("/api/partners/accept-invitation")
async def accept_partner_invitation(request: PartnerInvitationAcceptRequest, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user = await authenticated_user_details(authorization)
    if not user.get("email_confirmed_at"):
        raise HTTPException(403, "Confirm your email address before accepting this partner invitation.")
    rows = await supabase_rows("partner_invitations", {"token_hash": f"eq.{partner_invite_hash(request.token)}", "status": "eq.pending", "select": "id,showroom_id,partner_id,invite_email,expires_at", "limit": "1"})
    if not rows:
        raise HTTPException(404, "This invitation has already been used or is no longer valid.")
    invitation = rows[0]
    if str(user.get("email", "")).strip().lower() != invitation["invite_email"].strip().lower():
        raise HTTPException(403, "Sign in with the email address that received this invitation.")
    expires_at = datetime.fromisoformat(invitation["expires_at"].replace("Z", "+00:00"))
    if expires_at <= datetime.now(timezone.utc):
        await supabase_write("partner_invitations", {"status": "expired"}, {"id": f"eq.{invitation['id']}"}, "PATCH")
        raise HTTPException(410, "This invitation has expired. Ask the showroom owner to resend it.")
    current = await supabase_rows("showroom_members", {"showroom_id": f"eq.{invitation['showroom_id']}", "user_id": f"eq.{user['id']}", "select": "role,partner_id", "limit": "1"})
    if current and (current[0].get("role") != "partner" or current[0].get("partner_id") != invitation["partner_id"]):
        raise HTTPException(409, "This account already has a different role in this showroom.")
    if not current:
        await supabase_write("showroom_members", {"showroom_id": invitation["showroom_id"], "user_id": user["id"], "partner_id": invitation["partner_id"], "role": "partner"})
    await supabase_write("partner_invitations", {"status": "accepted", "accepted_by": user["id"], "accepted_at": datetime.now(timezone.utc).isoformat()}, {"id": f"eq.{invitation['id']}", "status": "eq.pending"}, "PATCH")
    return {"accepted": True, "showroom_id": invitation["showroom_id"], "role": "partner"}


@app.get("/api/partners/me")
async def partner_portal_summary(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = await authenticated_user(authorization)
    membership = await supabase_rows("showroom_members", {"user_id": f"eq.{user_id}", "role": "eq.partner", "select": "showroom_id,partner_id,created_at", "order": "created_at.desc", "limit": "1"})
    if not membership or not membership[0].get("partner_id"):
        raise HTTPException(403, "This account does not have a linked partner portal.")
    link = membership[0]
    partner_rows, showroom_rows, investments, settlements = await asyncio.gather(
        supabase_rows("partners", {"id": f"eq.{link['partner_id']}", "showroom_id": f"eq.{link['showroom_id']}", "select": "id,full_name,email,phone,ownership_percentage,profit_sharing_percentage,joining_date,status", "limit": "1"}),
        supabase_rows("showrooms", {"id": f"eq.{link['showroom_id']}", "select": "id,name,currency", "limit": "1"}),
        supabase_rows("partner_capital_entries", {"showroom_id": f"eq.{link['showroom_id']}", "partner_id": f"eq.{link['partner_id']}", "select": "id,entry_date,amount,entry_type,method,reference,notes,status", "order": "entry_date.desc", "limit": "500"}),
        supabase_rows("partner_settlements", {"showroom_id": f"eq.{link['showroom_id']}", "partner_id": f"eq.{link['partner_id']}", "select": "id,settlement_date,amount,settlement_type,reference,notes", "order": "settlement_date.desc", "limit": "500"}),
    )
    if not partner_rows:
        raise HTTPException(404, "Partner record is no longer available.")
    return {"showroom": showroom_rows[0] if showroom_rows else {}, "partner": partner_rows[0], "investments": investments, "settlements": settlements}


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
    if not user_id or not await showroom_owner(x_showroom_id, user_id):
        raise HTTPException(403, "Only the showroom owner can close a month.")
    try:
        start = date.fromisoformat(request.month_start)
    except ValueError:
        raise HTTPException(400, "month_start must be a valid calendar date.")
    if start.day != 1:
        raise HTTPException(400, "month_start must be the first day of its month.")
    end = add_billing_month(start)
    data = await snapshot(x_showroom_id, start, end)
    row = await supabase_write("monthly_closings", {"showroom_id": x_showroom_id, "month_start": request.month_start, "closed_at": datetime.now(timezone.utc).isoformat(), "closed_by": user_id, "revenue": data["revenue"], "cogs": data["cogs"], "gross_profit": data["gross_profit"], "operating_expenses": data["expenses"], "net_profit": data["net_profit"], "stock_units": data["inventory_units"], "notes": request.notes}, {"on_conflict": "showroom_id,month_start"})
    return {"saved": True, "closing": row, "figures": data}


@app.get("/api/admin/metrics")
async def admin_metrics(x_admin_secret: str | None = Header(default=None), authorization: str | None = Header(default=None)) -> dict[str, Any]:
    token = (authorization or "").removeprefix("Bearer ").strip()
    if not ((ADMIN_API_SECRET and x_admin_secret == ADMIN_API_SECRET) or await verify_super_admin(token)):
        raise HTTPException(403, "Admin access denied.")
    showrooms, subscriptions, memberships, inventory, sales, bookings, auth_users, payment_rows = await asyncio.gather(
        supabase_rows("showrooms", {"select": "id,created_at"}),
        supabase_rows("subscriptions", {"select": "showroom_id,status,monthly_amount,created_at", "order": "created_at.desc", "limit": "10000"}),
        supabase_rows("showroom_members", {"select": "user_id"}),
        supabase_rows("inventory_units", {"select": "quantity"}),
        supabase_rows("sales", {"select": "total,status"}),
        supabase_rows("bookings", {"select": "status"}),
        supabase_auth_user_count(),
        supabase_rows("subscription_payment_submissions", {"status": "eq.approved", "select": "amount"}),
    )
    latest_subscription_by_showroom: dict[str, dict[str, Any]] = {}
    for subscription in subscriptions:
        latest_subscription_by_showroom.setdefault(subscription.get("showroom_id", ""), subscription)
    current_subscriptions = list(latest_subscription_by_showroom.values())
    active_sales = [item for item in sales if str(item.get("status", "")).lower() not in {"cancelled", "canceled"}]
    return {
        "signup_count": auth_users,
        "showroom_count": len(showrooms),
        "active_showrooms": sum(1 for item in current_subscriptions if item.get("status") == "active"),
        "trial_count": sum(1 for item in current_subscriptions if item.get("status") == "trial"),
        "active_subscription_count": sum(1 for item in current_subscriptions if item.get("status") == "active"),
        "subscription_count": len(current_subscriptions),
        "mrr": sum(amount(item, "monthly_amount") for item in current_subscriptions if item.get("status") == "active"),
        "verified_payment_count": len(payment_rows),
        "verified_payment_total": sum(amount(item, "amount") for item in payment_rows),
        "member_count": len(memberships),
        "inventory_units": sum(int(item.get("quantity") or 0) for item in inventory),
        "recorded_sales": len(active_sales),
        "sales_volume": sum(amount(item, "total") for item in active_sales),
        "active_bookings": sum(1 for item in bookings if str(item.get("status", "")).lower() not in {"cancelled", "delivered"}),
    }


@app.get("/api/billing/subscription")
async def billing_subscription(authorization: str | None = Header(default=None), x_showroom_id: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = await authenticated_user(authorization)
    if not x_showroom_id or not await showroom_owner(x_showroom_id, user_id):
        raise HTTPException(403, "Only the showroom owner can view billing details.")
    subscriptions = await supabase_rows("subscriptions", {"showroom_id": f"eq.{x_showroom_id}", "status": "in.(trial,active,past_due,expired)", "select": "id,status,monthly_amount,next_billing_date,last_paid_at,provider_reference", "order": "created_at.desc", "limit": "1"})
    if not subscriptions:
        raise HTTPException(404, "No current subscription was found for this showroom.")
    settings = await supabase_rows("platform_payment_settings", {"select": "account_holder,bank_name,account_number,iban,raast_id,payment_instructions", "limit": "1"})
    payments = await supabase_rows("subscription_payment_submissions", {"showroom_id": f"eq.{x_showroom_id}", "select": "id,amount,currency,transfer_reference,transfer_date,status,created_at,review_note", "order": "created_at.desc", "limit": "30"})
    return {"subscription": subscriptions[0], "payment_details": settings[0] if settings else None, "payments": payments}


@app.post("/api/billing/ensure-trial")
async def ensure_trial_subscription(authorization: str | None = Header(default=None), x_showroom_id: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = await authenticated_user(authorization)
    if not x_showroom_id or not await showroom_owner(x_showroom_id, user_id):
        raise HTTPException(403, "Only the showroom owner can initialize billing.")
    rows = await supabase_rows("subscriptions", {"showroom_id": f"eq.{x_showroom_id}", "select": "id,status,created_at", "order": "created_at.desc", "limit": "1"})
    if rows:
        return {"created": False, "subscription": rows[0]}
    row = await supabase_write("subscriptions", {"showroom_id": x_showroom_id, "plan_id": "showroom", "status": "trial", "monthly_amount": 10000})
    return {"created": True, "subscription": row}


@app.post("/api/billing/subscription-payments")
async def submit_subscription_payment(request: BankTransferRequest, authorization: str | None = Header(default=None), x_showroom_id: str | None = Header(default=None)) -> dict[str, Any]:
    user_id = await authenticated_user(authorization)
    if not x_showroom_id or not await showroom_owner(x_showroom_id, user_id):
        raise HTTPException(403, "Only the showroom owner can submit a subscription payment.")
    try:
        date.fromisoformat(request.transfer_date)
    except ValueError:
        raise HTTPException(400, "Transfer date is invalid.")
    subscriptions = await supabase_rows("subscriptions", {"showroom_id": f"eq.{x_showroom_id}", "status": "in.(trial,active,past_due,expired)", "select": "id,monthly_amount", "order": "created_at.desc", "limit": "1"})
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
    await log_admin_action(user_id, "payment_settings_updated", "platform_payment_settings", "platform", {"bank_name": request.bank_name, "account_holder": request.account_holder})
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
    await log_admin_action(reviewer_id, f"subscription_payment_{decision_status}", "subscription_payment_submissions", payment_id, {"showroom_id": payment["showroom_id"], "transfer_reference": payment["transfer_reference"], "note": request.note})
    return {"reviewed": True, "payment": reviewed, "subscription_activated": request.decision == "approve"}


@app.get("/api/admin/activity-logs")
async def admin_activity_logs(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    await require_admin(authorization)
    logs = await supabase_rows("platform_activity_logs", {"select": "id,actor_id,event_type,target_type,target_id,details,created_at", "order": "created_at.desc", "limit": "500"})
    return {"logs": logs}


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
    if not user_id or not await showroom_operator(x_showroom_id, user_id):
        raise HTTPException(403, "Showroom access denied.")
    data = await snapshot(x_showroom_id)
    generated = await model_answer(request.question, data)
    return {"answer": generated or fallback(request.question, data), "source": "ai" if generated else "verified-fallback", "data": data}
