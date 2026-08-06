from dotenv import load_dotenv
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Attempt to load .env from project root and backend folder (development convenience)
BASE_DIR = Path(__file__).resolve().parents[2]
env_paths = [BASE_DIR / '.env', BASE_DIR / 'backend' / '.env']
for p in env_paths:
    if p.exists():
        load_dotenv(dotenv_path=p)
        logger.debug(f"Loaded environment from {p}")
        break
else:
    # still call load_dotenv() to allow default lookup behavior
    load_dotenv()


def get_database_url():
    """Return DATABASE_URL from env or None.

    The caller can decide how to handle a missing value; by default
    the application falls back to a local sqlite file for development.
    """
    return os.getenv('DATABASE_URL')


def get_env(key: str, default=None):
    return os.getenv(key, default)


def get_bool(key: str, default: bool = False):
    val = os.getenv(key)
    if val is None:
        return default
    return val.lower() in ("1", "true", "yes", "on")
