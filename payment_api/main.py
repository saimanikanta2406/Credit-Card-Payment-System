from fastapi import FastAPI

from database import Base, engine
import models
from routes import router
from fastapi.middleware.cors import CORSMiddleware


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Credit Card Payment API",
    description="Payment processing service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "Credit Card Payment API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }