import os
from dotenv import load_dotenv

# Load env FIRST
load_dotenv(dotenv_path=".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ Create app FIRST
app = FastAPI()

# ✅ Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Import routers AFTER app creation (clean practice)
from api.travel_routes import router as travel_router
from api.chat_routes import router as chat_router

# ✅ Include routers
app.include_router(travel_router)
app.include_router(chat_router)