import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------
# ✅ LOAD ENV (EXPLICIT + SAFE)
# ---------------------------------------------------

env_path = os.path.join(os.getcwd(), ".env")

print("🔥 USING ENV FILE:", env_path)
print("🔥 EXISTS:", os.path.exists(env_path))

load_dotenv(env_path)

print("🔥 SESSION LIMIT:", os.getenv("SESSION_LIMIT"))
print("🔥 ENVIRONMENT:", os.getenv("ENVIRONMENT"))

# ---------------------------------------------------
# ✅ CREATE FASTAPI APP
# ---------------------------------------------------

app = FastAPI()

# ---------------------------------------------------
# ✅ CORS CONFIG
# ---------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# ✅ IMPORT ROUTES (AFTER ENV + APP INIT)
# ---------------------------------------------------

from api.travel_routes import router as travel_router
from api.chat_routes import router as chat_router

# ---------------------------------------------------
# ✅ INCLUDE ROUTERS
# ---------------------------------------------------

app.include_router(travel_router)
app.include_router(chat_router)