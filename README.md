# 🌙 PureMoon.AI

**Your Intelligent Travel & Life Assistant**

PureMoon.AI is a full-stack AI-powered travel planning application that transforms natural language inputs into structured, personalized travel itineraries — enriched with real places, food, hotels, and actionable insights.

---

## ✨ Features

* 🧠 **AI-Powered Travel Planning**

  * Generate itineraries using natural language
  * Example: *"Plan a 2-day trip to Austin in budget $600"*

* 🔄 **Conversational Updates**

  * Modify trips dynamically
  * Example: *"Make it 4 days"*, *"Add nightlife"*

* 🍽️ **Smart Recommendations**

  * Restaurants, food options, nightlife suggestions
  * Powered by real location data

* 🏨 **Hotel Suggestions**

  * Curated stays with pricing insights

* 🗺️ **Map Integration**

  * View restaurants & hotels on interactive maps

* 📊 **Trip Intelligence Panel**

  * Destination, duration, budget breakdown
  * Confidence score & insights

* 📄 **PDF Download**

  * Export full itinerary with branding

* 📈 **Analytics Dashboard**

  * Track user behavior (messages, clicks, selections)

* 🔐 **Secure Backend**

  * Supabase integration with server-side data handling

---

## 🏗️ Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Framer Motion (animations)
* React Leaflet (maps)
* NextAuth (Google OAuth)

### Backend

* FastAPI
* Python
* Pydantic

### Database

* Supabase (PostgreSQL)

### AI & APIs

* Google Gemini (LLM)
* Google Places API (restaurants & hotels)
* Open-Meteo (weather)

---

## ⚙️ Architecture Overview

```
User Input → NLP Extraction → Session Manager → Travel Expert
           → AI Enrichment → Places API → Response Builder
           → Frontend Rendering (Chat + Map + Insights)
```

---

## 🧠 How It Works

1. User sends a natural query
2. Hybrid NLP extracts:

   * Destination
   * Days
   * Budget
3. Session tracks context
4. TravelExpert generates itinerary
5. APIs enrich with:

   * Restaurants
   * Hotels
   * Weather
6. Structured response returned to UI

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/your-username/puremoon-ai.git
cd puremoon-ai
```

---

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env`:

```
GEMINI_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
SESSION_LIMIT=7
ENVIRONMENT=dev
```

Run server:

```bash
uvicorn app.main:app --reload
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints

### Travel Chat

```
POST /travel/chat
```

Request:

```json
{
  "session_id": "user_1",
  "message": "Plan a 3 day trip to Miami under $800"
}
```

---

### Analytics

```
GET /analytics/events
```

---

## 📁 Project Structure

```
backend/
 ├── api/
 │   ├── travel_routes.py
 │   ├── chat_routes.py
 │   └── analytics_routes.py
 ├── services/
 ├── models/
 └── main.py

frontend/
 ├── app/
 │   ├── dashboard/
 │   ├── components/
 │   └── page.tsx
 ├── lib/
 └── styles/
```

---

## 📌 Roadmap

* [ ] Session-based usage limits (production-ready)
* [ ] Trip editing (food/nightlife modification)
* [ ] Expense splitting (Splitwise-style)
* [ ] Itinerary sharing & collaboration
* [ ] Weather integration UI
* [ ] NLP improvements for flexible inputs

---

## ⚠️ Disclaimer

PureMoon may make mistakes. Please verify and validate travel information before making decisions.

---

## 👨‍💻 Author

**Ankush Choudhari**
Business Analyst → Product Builder → AI Enthusiast

---

## 🌟 Vision

To build a travel assistant that doesn't just plan trips — but *thinks, adapts, and travels with you.*

---
