# FraudSense Live - Anomaly Detection Dashboard

An intelligent, client-side machine learning dashboard for detecting anomalies in CSV datasets in real-time. Simply upload your data and get instant insights with interactive visualizations and detailed analysis.

## ✨ Features

- **Easy File Upload** - Drag and drop or click to upload CSV files
- **Real-time Anomaly Detection** - Client-side ML using TensorFlow.js (no server required)
- **Interactive Dashboards** - Visualize trends, distributions, and anomalies
- **Schema Inference** - Automatic data type detection
- **Model Performance Metrics** - See accuracy, precision, recall at a glance
- **Detailed Reports** - Tables and charts for comprehensive analysis

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **ML Library**: TensorFlow.js (client-side processing)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Data Handling**: Zod for schema validation
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Charting**: Recharts for visualizations
- **Database**: Supabase (optional integration)

## 📋 Prerequisites

- Node.js 18+ or Bun installed
- A modern web browser
- CSV files for analysis

## 🚀 Getting Started

### 1. **Install Dependencies**

Using Bun (recommended):

```bash
bun install
```

Or using npm:

```bash
npm install
```

### 2. **Start Development Server**

```bash
bun dev
```

The application will open at `http://localhost:5173`

### 3. **Upload Your Data**

1. Click the upload area or drag a CSV file into the dashboard
2. Click "Analyze" to start processing
3. Watch the real-time processing stages:
   - Uploading
   - Parsing
   - Schema Inference
   - Preprocessing
   - Model Training
   - Evaluation

### 4. **Explore Results**

Once analysis completes, view:

- **Anomalies Table** - List of detected anomalies with scores
- **Time Series Chart** - Trends over time
- **Distribution Charts** - Data distribution analysis
- **Model Performance** - Key metrics (accuracy, precision, recall)
- **Data Schema** - Inferred data types and statistics

## 📁 Project Structure

```
src/
├── components/        # React components
│   ├── AnomalyTable.tsx
│   ├── TimeSeriesChart.tsx
│   ├── DistributionChart.tsx
│   ├── FileUpload.tsx
│   └── ui/           # shadcn/ui components
├── pages/            # Route pages
├── lib/              # ML and utility functions
├── hooks/            # Custom React hooks
├── types/            # TypeScript definitions
└── integrations/     # External services (Supabase)
```

## 🔧 Available Scripts

```bash
# Development server
bun dev

# Production build
bun run build

# Development build
bun run build:dev

# Preview production build
bun run preview

# Lint code
bun run lint
```

## 🎯 How It Works

1. **Upload CSV** → File is read in your browser
2. **Parse Data** → Automatic schema and data type detection
3. **Preprocess** → Normalize and prepare data for ML
4. **Train Model** → TensorFlow.js trains anomaly detection model
5. **Detect Anomalies** → Algorithm identifies unusual patterns
6. **Visualize Results** → Interactive charts and tables display findings

## 🌐 Deployment

### Deploy to Netlify

The project includes `netlify.toml` for easy deployment:

```bash
# Build for production
bun run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## 📝 CSV Format Requirements

Your CSV should have:

- A header row with column names
- Consistent data types per column
- Numeric data for most features (anomaly detection works best with numbers)

Example:

```
timestamp,amount,user_id,risk_score
2024-01-01,150.00,usr_123,0.2
2024-01-02,450.00,usr_456,0.8
```

## 🐛 Troubleshooting

**Upload not working?**

- Ensure file is a valid CSV
- Check file size isn't too large (recommended: <10MB)

**Slow analysis?**

- Larger datasets take longer to process
- Processing happens on your device (no server delays)

**Unexpected results?**

- Check for missing or invalid data in CSV
- Ensure numeric columns have proper formatting

## 📦 Dependencies Highlights

- **@tensorflow/tfjs** - Machine learning
- **recharts** - Data visualization
- **zod** - Schema validation
- **react-router-dom** - Routing
- **@tanstack/react-query** - State management
- **tailwindcss** - Styling

## 📄 License

Project is part of Hackathon initiative.

## 🤝 Contributing

Feel free to open issues and submit pull requests for improvements!

---

**Happy analyzing! 🚀**
