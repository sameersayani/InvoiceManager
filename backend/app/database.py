from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import os
import time
from contextlib import contextmanager

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://sameer:6BxDIvvmXdTzk1oV29oUekgjHTXpg3Ed@35.227.164.209/invoice_db_jrr1")

# Add SSL mode if not present
if DATABASE_URL and "sslmode" not in DATABASE_URL:
    if "?" in DATABASE_URL:
        DATABASE_URL += "&sslmode=require"
    else:
        DATABASE_URL += "?sslmode=require"

# Engine configuration with better timeout and pool settings
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,  # Recycle connections every 5 minutes
    pool_size=5,       # Maintain up to 5 connections
    max_overflow=10,   # Allow up to 10 additional connections
    connect_args={
        "connect_timeout": 30,  # Connection timeout in seconds
        "keepalives": 1,       # Enable TCP keepalives
        "keepalives_idle": 30  # Seconds between keepalives
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

@contextmanager
def get_db_with_retry(max_retries=3, retry_delay=1):
    """Get database session with retry logic"""
    attempt = 0
    last_exception = None

    while attempt < max_retries:
        try:
            db = SessionLocal()
            try:
                yield db
                return
            finally:
                db.close()
        except OperationalError as e:
            last_exception = e
            attempt += 1
            if attempt < max_retries:
                time.sleep(retry_delay)
            
    raise last_exception

# For backwards compatibility
def get_db():
    """Legacy get_db function that uses the retry logic"""
    with get_db_with_retry() as db:
        yield db