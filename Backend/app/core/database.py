from app.core.config import settings
from sqlalchemy import create_engine, text

engine = create_engine(settings.database_url)

# Temporary connection test
with engine.connect() as connection:
    result = connection.execute(text("SELECT 3"))
    print(result.scalar())