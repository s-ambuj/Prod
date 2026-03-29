from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings
from app.core.database import connect_db, disconnect_db
from app.exceptions import register_exception_handlers
from app.middleware import LoggingMiddleware, RateLimiterMiddleware, AuditMiddleware

app = FastAPI(
    title="Healthcare Appointment & E-Prescription System",
)

register_exception_handlers(app)
app.add_middleware(LoggingMiddleware)
app.add_middleware(AuditMiddleware)
app.add_middleware(RateLimiterMiddleware, max_requests=100, window_seconds=60)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    await disconnect_db()

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Healthcare Appointment & E-Prescription System"
    }
