from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import os
import time
import logging

logger = logging.getLogger(__name__)

# Keep existing env fallback but prefer using DATABASE_URL from env
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://sameer:noBMvy9dwXzCjAoNvbsp83vN789PFsco@dpg-d4t9k7khg0os73cp6jh0-a.oregon-postgres.render.com/invoice_db_jrr1_9kkl"
)

# Ensure SSL mode for hosted Postgres providers (Render, Heroku, etc.)
if DATABASE_URL and "sslmode" not in DATABASE_URL:
    if "?" in DATABASE_URL:
        DATABASE_URL += "&sslmode=require"
    else:
        DATABASE_URL += "?sslmode=require"

# Create engine with more robust connection settings
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