from fastapi import FastAPI
from app.core.database import engine

app = FastAPI()

@app.get("/")
async def test():
    return {"message": "Hello, World!"}