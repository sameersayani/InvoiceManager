from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:sameer@localhost:5432/invoice_db")
# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://sameer:y65R63viWRvZMgPmmm5x4UOHwhGhfBCL@dpg-d3e36vndiees73fr0q2g-a.oregon-postgres.render.com/invoice_db_uots")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://sameer:6BxDIvvmXdTzk1oV29oUekgjHTXpg3Ed@dpg-d42pio1r0fns739is3dg-a.oregon-postgres.render.com/invoice_db_jrr1?sslmode=require")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,       # keeps connections fresh
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()