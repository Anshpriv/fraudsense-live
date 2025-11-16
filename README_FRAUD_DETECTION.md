# Fraud Detection Platform - Hackathon Ready

A complete fraud detection web application with ML model training, real-time progress tracking, and transaction simulation.

## 🚀 Features

- **Real-time CSV Analysis**: Upload transaction data and see instant statistics
- **Animated Training Progress**: Watch your model train with live progress updates
- **Transaction Simulator**: Test fraud detection on sample transactions
- **User Authentication**: Secure login and signup
- **Beautiful UI**: Modern design with smooth animations

## 🏗️ Architecture

### Frontend (Current Implementation)
- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui
- **State Management**: React hooks
- **Real-time**: WebSocket support ready
- **CSV Parsing**: PapaParse for client-side analysis
- **Backend**:  (Supabase) for auth, database, and storage

### Backend (To Be Implemented - Python FastAPI)

This frontend is ready to connect to a Python FastAPI backend. Here's what you need to implement:

## 📦 Python Backend Setup

### Required Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI app with WebSocket support
│   ├── train.py          # ML training with progress callbacks
│   ├── ws_manager.py     # WebSocket connection manager
│   ├── models.py         # Data models
│   └── ml/
│       ├── train_model_from_csv.py  # Core training function
│       └── score.py      # Model inference
├── models/               # Trained model artifacts
├── uploads/             # CSV uploads
├── requirements.txt
└── .env
```

### Key Backend Requirements

#### 1. Training Function Signature

```python
# app/train.py
from typing import Callable, Dict, Any

def train_model_from_csv(
    csv_path: str, 
    user_id: str, 
    progress_callback: Callable[[int, Dict[str, Any]], None]
) -> Dict[str, Any]:
    """
    Train fraud detection model from CSV with progress updates.
    
    Args:
        csv_path: Path to uploaded CSV file
        user_id: User ID for model association
        progress_callback: Function to call with (percent, payload) updates
        
    Returns:
        Final model metrics and metadata
    """
    # Call progress_callback at these milestones:
    # - 5%: Parsed N rows
    # - 20%: Feature extraction complete
    # - 40%: Vectorization done
    # - 60%: Training started
    # - 80%: Evaluation complete
    # - 95%: Model saved
    # - 100%: Registration complete
    
    # Example call:
    progress_callback(20, {
        "msg": "Feature extraction complete",
        "intermediate_metrics": {
            "samples_processed": 1000,
            "top_merchants": [["Electronics", 120], ["Grocery", 90]],
            "feature_importances": {"amount": 0.35, "hour": 0.15}
        }
    })
```

#### 2. WebSocket Message Types

```python
# Training Progress Events
{
    "type": "training_started",
    "upload_id": "<uuid>",
    "user_id": "<user>",
    "msg": "Training queued"
}

{
    "type": "training_progress",
    "upload_id": "<uuid>",
    "percent": 42,
    "msg": "Feature extraction complete",
    "intermediate_metrics": {
        "samples_processed": 4200,
        "top_merchants": [["Electronics", 120]],
        "feature_importances": {"amount": 0.42, "hour": 0.12}
    }
}

{
    "type": "training_done",
    "upload_id": "<uuid>",
    "model_version": "v20251116_001",
    "metrics": {
        "precision": 0.87,
        "recall": 0.76,
        "roc_auc": 0.91
    },
    "model_path": "models/user_<id>/model_v20251116_001.joblib"
}

{
    "type": "training_error",
    "upload_id": "<uuid>",
    "msg": "Error message"
}
```

#### 3. API Endpoints

```python
# app/main.py
from fastapi import FastAPI, UploadFile, WebSocket
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/upload")
async def upload_csv(
    file: UploadFile,
    user_id: str,
    retrain: bool = True
):
    """
    1. Save CSV to storage
    2. Create upload record in Supabase
    3. Return upload_id immediately
    4. Start background training task
    """
    pass

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Handle WebSocket connections for training progress.
    Send JWT in query string or first message for auth.
    """
    pass

@app.get("/api/model/status")
async def get_model_status(user_id: str):
    """Return latest model version and status"""
    pass

@app.post("/api/score_sample")
async def score_sample(
    user_id: str,
    amount: float,
    merchant: str,
    category: str,
    transaction_time: str
):
    """Score a single transaction"""
    pass
```

#### 4. WebSocket Manager

```python
# app/ws_manager.py
from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
    
    async def broadcast_to_user(self, user_id: str, message: dict):
        """Broadcast training progress to specific user"""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)

manager = ConnectionManager()
```

### Environment Variables

Create `.env` in backend/:

```env
# Supabase 
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret



### Requirements.txt

```txt
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
python-multipart>=0.0.6
websockets>=12.0
pandas>=2.1.0
numpy>=1.26.0
scikit-learn>=1.3.0
joblib>=1.3.0
supabase>=2.0.0
pydantic>=2.4.0
python-jose[cryptography]>=3.3.0
```

### Running the Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 🗄️ Database Schema (Already Created)

- **profiles**: User profiles
- **uploads**: CSV upload tracking with interim_metrics (JSONB)
- **models**: Trained ML models with metrics
- **transactions**: Transaction records for simulation

## 🎯 CSV Data Format

Expected CSV columns:
- `amount` or `Amount`: Transaction amount (float)
- `merchant` or `Merchant`: Merchant name (string)
- `category`: Transaction category (string, optional)
- `transaction_time` or `time`: Transaction timestamp
- `is_fraud` or `fraud`: Fraud label (boolean, optional for training)
- `user_id` or `userId`: User identifier (optional)

## 🔐 Authentication Flow

1. Frontend uses Supabase auth
2. User gets JWT token after login
3. Send JWT in WebSocket query string: `/ws?token=<jwt>`
4. Backend verifies JWT using SUPABASE_JWT_SECRET
5. Only send training events to authenticated user

## 📊 Demo Mode

The frontend currently works in demo mode with:
- Simulated training progress
- Mock statistics
- Animated progress bars
- Sample predictions

Connect your Python backend to enable real ML training!

## 🚀 Next Steps

1. **Implement Python Backend**: Follow the structure above
2. **ML Model**: Implement `train_model_from_csv()` with your fraud detection algorithm
3. **WebSocket Integration**: Connect frontend to your FastAPI WebSocket
4. **Model Persistence**: Save trained models using joblib or pickle
5. **Storage**: Upload CSVs to Supabase Storage or local filesystem

## 🎨 Frontend Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🧪 Testing the Flow

1. Sign up / Login
2. Navigate to Upload page
3. Drop a CSV file
4. Watch real-time progress
5. See intermediate metrics update
6. Test the trained model in Simulator

## 📝 Notes

- Email confirmation is disabled for faster testing
- Training progress uses smooth interpolation for better UX
- All training events persist in database for reconnection support
- WebSocket connection automatically reconnects on disconnect

## 🤝 Integration Checklist

- [ ] Python FastAPI backend set up
- [ ] WebSocket endpoint implemented
- [ ] CSV upload endpoint working
- [ ] train_model_from_csv() with progress callbacks
- [ ] Model scoring endpoint
- [ ] Supabase integration for persistence
- [ ] JWT authentication on backend
- [ ] CORS configured for frontend URL
- [ ] Model versioning system
- [ ] Error handling and recovery

---


