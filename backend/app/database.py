from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import os
import time
import logging
from app.config import get_database_url

logger = logging.getLogger(__name__)

# Get DATABASE_URL via centralized config helper (reads .env if present)
DATABASE_URL = get_database_url()

# Avoid committing credentials in source: if DATABASE_URL is not set,
# fall back to a local SQLite file for development to make setup easier
# and prevent accidental exposure of production database credentials.
if not DATABASE_URL:
    logger.warning(
        "DATABASE_URL not set in environment; falling back to local SQLite './invoice.db' for development."
    )
    DATABASE_URL = "sqlite:///./invoice.db"

# If using Postgres and no explicit sslmode provided, append it for hosted providers
if DATABASE_URL.startswith("postgresql") and "sslmode" not in DATABASE_URL:
    if "?" in DATABASE_URL:
        DATABASE_URL += "&sslmode=require"
    else:
        DATABASE_URL += "?sslmode=require"

# Create engine with settings appropriate to the DB type
if DATABASE_URL.startswith("sqlite"):
    # SQLite - use check_same_thread for file-based DB used in development
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,   # recycle connections every 5 minutes
        pool_size=5,
        max_overflow=10,
        connect_args={
            "connect_timeout": 10
        },
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db(retries: int = 3, backoff_seconds: float = 1.0):
    """
    Dependency generator that yields a DB session.
    Adds a small retry loop to handle transient connection errors.
    """
    last_exc = None
    for attempt in range(1, retries + 1):
        try:
            # quick test connection to fail fast if DB is unreachable
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            db = SessionLocal()
            try:
                yield db
            finally:
                db.close()
            return
        except OperationalError as e:
            last_exc = e
            logger.warning(
                "Database connection failed (attempt %d/%d): %s",
                attempt,
                retries,
                str(e),
            )
            if attempt < retries:
                time.sleep(backoff_seconds * attempt)
    # If we get here, all retries failed
    logger.error("Could not connect to the database after %d attempts", retries)
    raise last_exc