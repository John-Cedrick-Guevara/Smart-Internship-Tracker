import uvicorn
from fastapi import FastAPI
from app.api.v1.api import api_router

app = FastAPI(title="Smart Internship AI Service", version="1.0.0")

# Register our v1 routes
app.include_router(api_router, prefix="/api/v1")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)