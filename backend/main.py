import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Generator

from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pwdlib import PasswordHash
from sqlalchemy import DateTime, ForeignKey, String, create_engine, select, or_, inspect, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

APP_ENV = os.getenv("APP_ENV", "development").lower()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smartbudget.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+psycopg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

SESSION_COOKIE = "smartbudget_session"
SESSION_DAYS = 7
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "true" if APP_ENV == "production" else "false").lower() == "true"
COOKIE_SAMESITE = "none" if COOKIE_SECURE else "lax"
FRONTEND_ORIGINS = [
    item.strip().rstrip("/")
    for item in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if item.strip()
]

if APP_ENV == "production" and DATABASE_URL.startswith("sqlite"):
    raise RuntimeError("Production requires PostgreSQL. Set DATABASE_URL to a persistent PostgreSQL connection string.")

engine_options = {"pool_pre_ping": True}
if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, **engine_options)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
password_hasher = PasswordHash.recommended()
limiter = Limiter(key_func=get_remote_address)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(20), unique=True, index=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    sessions: Mapped[list["LoginSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class LoginSession(Base):
    __tablename__ = "login_sessions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user: Mapped[User] = relationship(back_populates="sessions")

Base.metadata.create_all(bind=engine)

# Idempotent migration for the earlier email-only prototype.
with engine.begin() as connection:
    columns = {column["name"] for column in inspect(engine).get_columns("users")}
    if "username" not in columns:
        connection.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR(40)"))
    if "phone" not in columns:
        connection.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(20)"))
    connection.execute(text("UPDATE users SET username = 'legacy_' || id WHERE username IS NULL OR username = ''"))
    connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username)"))
    connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_phone ON users (phone)"))

app = FastAPI(title="SmartBudget Authentication API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
@app.middleware("http")
async def enforce_browser_origin(request: Request, call_next):
    if APP_ENV == "production" and request.method in {"POST", "PATCH", "PUT", "DELETE"}:
        origin = request.headers.get("origin", "").rstrip("/")
        if origin not in FRONTEND_ORIGINS:
            return Response(content='{"detail":"Request origin is not allowed."}', status_code=403, media_type="application/json")
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type"],
)

class RegisterBody(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    username: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9_.-]+$")
    phone: str | None = Field(default=None, max_length=20, pattern=r"^\+?[0-9 ()-]{7,20}$")
    password: str = Field(min_length=12, max_length=128)

class LoginBody(BaseModel):
    identifier: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)

class ProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    username: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9_.-]+$")
    phone: str | None = Field(default=None, max_length=20, pattern=r"^\+?[0-9 ()-]{7,20}$")

class UserView(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    username: str
    phone: str | None = None

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def digest_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        path="/",
    )

def create_session(db: Session, user: User, response: Response) -> None:
    token = secrets.token_urlsafe(48)
    session_row = LoginSession(
        user_id=user.id,
        token_hash=digest_token(token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS),
    )
    db.add(session_row)
    db.commit()
    set_session_cookie(response, token)

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Please sign in to continue.")
    session_row = db.scalar(select(LoginSession).where(LoginSession.token_hash == digest_token(token)))
    if not session_row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Your session is invalid. Please sign in again.")
    expires = session_row.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires <= datetime.now(timezone.utc):
        db.delete(session_row)
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Your session has expired. Please sign in again.")
    return session_row.user

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "smartbudget-auth"}

def normalize_phone(phone: str | None) -> str | None:
    if not phone: return None
    normalized = "".join(character for character in phone if character.isdigit() or character == "+")
    return normalized or None

def public_user(user: User) -> dict:
    return {"id": user.id, "name": user.name, "username": user.username, "phone": user.phone}

@app.post("/auth/register", response_model=UserView, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
def register(request: Request, body: RegisterBody, response: Response, db: Session = Depends(get_db)) -> dict:
    username = body.username.strip().lower()
    phone = normalize_phone(body.phone)
    existing = db.scalar(select(User).where(or_(User.username == username, User.email == f"{username}@accounts.smartbudget.invalid")))
    if existing: raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That User ID is already taken. Please choose another.")
    if phone and db.scalar(select(User).where(User.phone == phone)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That phone number is already registered.")
    # Keep the legacy email column internal for compatibility with existing deployments.
    user = User(name=body.name.strip(), username=username, phone=phone, email=f"{username}@accounts.smartbudget.invalid", password_hash=password_hasher.hash(body.password))
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That User ID or phone number is already registered.")
    create_session(db, user, response)
    return public_user(user)

@app.post("/auth/login", response_model=UserView)
@limiter.limit("10/minute")
def login(request: Request, body: LoginBody, response: Response, db: Session = Depends(get_db)) -> dict:
    identifier = body.identifier.strip()
    normalized_identifier = identifier.lower()
    phone_identifier = normalize_phone(identifier) if all(character.isdigit() or character in "+-() " for character in identifier) else None
    user = db.scalar(select(User).where(or_(User.username == normalized_identifier, User.phone == phone_identifier, User.email == normalized_identifier)))
    if not user or not password_hasher.verify(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID/phone number or password is incorrect.")
    create_session(db, user, response)
    return public_user(user)

@app.get("/auth/me", response_model=UserView)
def me(user: User = Depends(get_current_user)) -> dict:
    return public_user(user)

@app.patch("/auth/me", response_model=UserView)
def update_profile(body: ProfileUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    username = body.username.strip().lower()
    phone = normalize_phone(body.phone)
    if db.scalar(select(User).where(User.username == username, User.id != user.id)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That User ID is already taken.")
    if phone and db.scalar(select(User).where(User.phone == phone, User.id != user.id)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That phone number is already registered.")
    user.name = body.name.strip()
    user.username = username
    user.phone = phone
    user.email = f"{username}@accounts.smartbudget.invalid"
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That User ID or phone number is already in use.")
    return public_user(user)
@app.post("/auth/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)) -> dict[str, str]:
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        session_row = db.scalar(select(LoginSession).where(LoginSession.token_hash == digest_token(token)))
        if session_row:
            db.delete(session_row)
            db.commit()
    response.delete_cookie(key=SESSION_COOKIE, path="/", httponly=True, secure=COOKIE_SECURE, samesite=COOKIE_SAMESITE)
    return {"status": "signed_out"}
