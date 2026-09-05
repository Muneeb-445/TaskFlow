from app.core.config import settings
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker 

engine = create_engine(settings.database_url)

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
    )

# # Temporary connection test
# with engine.connect() as connection:
#     result = connection.execute(text("SELECT 3"))
#     print(result.scalar())