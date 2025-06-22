# Weather Lookup App

A full-stack weather request and lookup application that allows users to:

* Submit weather data requests by date and location
* Retrieve real-time weather data using the WeatherStack API
* View previously submitted request IDs from local storage for reuse

---

## 🔧 Tech Stack

### Frontend:

* React 18 with App Router
* ShadCN UI (Tailwind CSS, UI components)
* TypeScript

### Backend:

* FastAPI (Python)
* WeatherStack API integration
* `.env` config loading with `python-dotenv`

---

## 🚀 Features

* 🌦 Submit weather requests (date, location, notes)
* 🔄 Real-time weather info via WeatherStack
* 📌 Recently submitted request history (localStorage)
* 🔍 Lookup previous data by request ID
* ❌ Graceful error handling for invalid input/API failure

---

## 📁 Project Structure

```
root/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── .env
│   └── requirements.txt
├── frontend/
│   └── (React app)
└── README.md
```

---

## 🧪 Running the App

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in `backend/`:

```
WEATHERSTACK_API_KEY=your_api_key_here
```

Get your API key at: [https://weatherstack.com](https://weatherstack.com)

---

## ✅ Example API Endpoints

* `POST /weather` → Submit request
* `GET /weather/{id}` → Lookup weather data by ID

---

## 🙌 Credits

Built by Zayan Sadath for the Lynkr Assessment

---

