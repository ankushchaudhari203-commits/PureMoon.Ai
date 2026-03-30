import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.analytics_routes import router as analytics_router
from api.data_routes import router as data_router

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

allowed_origins = ["http://localhost:3000"]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
app.include_router(analytics_router)
app.include_router(data_router)
