# 📝 Sentiment Analysis App

A full-stack application for scraping product reviews, performing sentiment analysis using NLP and ML models, and visualizing the results in an interactive dashboard.

## 🌟 Features

- 🛍️ **Product Scraping**: Extract product information from multiple categories
- 💬 **Review Extraction**: Scrape customer reviews using advanced techniques
- 📊 **Sentiment Analysis**: Analyze review sentiment with enhanced accuracy using multiple models
- 🌐 **Web Interface**: User-friendly React-based web application
- 🔄 **Batch Processing**: Process multiple categories automatically
- 📈 **Comprehensive Reports**: Detailed sentiment analysis reports with visualizations
- 🔐 **User Authentication**: Secure login and registration system
- ⚡ **Real-time Processing**: Live progress tracking during analysis

## 🎨 Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Primary Red | `#e40046` | Primary buttons, accents |
| Black | `#000000` | Text, borders |
| Light Black (10%) | `#0000001a` | Subtle backgrounds |
| Soft Red | `#e06a6e` | Secondary elements |
| Navy Black | `#06081fe0` | Dark backgrounds |
| Dark Gray | `#333333` | Secondary text |
| Medium Gray | `#5a5a59` | Disabled elements |
| White | `#ffffff` | Backgrounds, text on dark |
| Rating Yellow | `#ffc315` | Star ratings, highlights |

## 🏗️ Architecture

```
sentiment-analysis-app/
├── backend/          # Flask API with scraping & analysis
└── frontend/         # React Vite application
```

## ⚙️ Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Chrome/Firefox browser (for web scraping)

## 🚀 Backend Setup

### 1. Navigate to backend directory

```bash
cd backend
```

### 2. Create and activate virtual environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Download NLTK data

```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('vader_lexicon'); nltk.download('brown')"
```

### 5. Set up environment variables

Create a `.env` file in the backend directory:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
FLASK_ENV=development
FLASK_DEBUG=1
```

### 6. Run the backend server

```bash
python app.py
```

The backend API will be available at `http://localhost:5000`

## 💻 Frontend Setup

### 1. Navigate to frontend directory

```bash
cd frontend
```

### 2. Install Node.js dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_key_here
```

### 4. Start the development server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📊 Tech Stack

### Backend

- **Python** - Core programming language
- **Flask** - Web framework
- **Selenium, BeautifulSoup4** - Web scraping
- **Pandas, NLTK, TextBlob, Transformers, Scikit-learn** - NLP & ML processing
- **Matplotlib** - Data visualization
- **Supabase** - Authentication and database

### Frontend

- **React + Vite** - UI framework and build tool
- **Tailwind CSS + shadcn/ui** - Styling and components
- **Chart.js + react-chartjs-2** - Data visualization
- **Axios** - API communication

## 🗃️ Database Setup

The application uses Supabase for authentication and data storage. Follow these steps to set up:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and API key from Settings > API
4. Update the environment variables in both backend and frontend
5. Run the SQL schema from `supabase_schema.sql` in the Supabase SQL editor

## 🔧 Configuration

### Backend Configuration (`backend/config.py`)

Update the following settings as needed:

- Scraping timeouts and retries
- Sentiment analysis model preferences
- File storage paths
- API rate limiting

### Frontend Configuration (`frontend/src/services/api.js`)

Update API endpoints if different from default:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

## 🧪 Testing the Application

### 1. Start both servers

```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
python app.py

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Access the application

Open your browser and navigate to `http://localhost:5173`

### 3. Create an account

Register a new account through the authentication page

### 4. Test scraping functionality

1. Navigate to the product search page
2. Select a category (e.g., "Electronics - Laptops")
3. Click "Scrape Products" to gather product data

### 5. Test sentiment analysis

1. Select products from the results
2. Click "Analyze Sentiment" to process reviews
3. Monitor progress in the processing queue
4. View results in the visualization dashboard

## 📁 Project Structure Details

### Backend Structure

```
backend/
├── analyzer/                 # Sentiment analysis modules
├── data/                    # JSON data storage
├── auth_env/                # Virtual environment (auto-generated)
├── app.py                   # Main Flask application
├── auth_supabase.py         # Supabase authentication
├── scrape_products.py       # Product scraping logic
├── sentiment_analysis.py    # Sentiment analysis orchestration
└── requirements.txt         # Python dependencies
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Application pages
│   │   ├── product-search-selection/    # Product discovery
│   │   ├── sentiment-analysis-processing/ # Analysis workflow
│   │   ├── sentiment-visualization-dashboard/ # Results
│   │   ├── user-authentication/         # Login/register
│   │   └── user-profile-settings/       # User management
│   ├── services/           # API services
│   ├── styles/             # CSS stylesheets
│   └── utils/              # Utility functions
└── public/                 # Static assets
```

## 🐛 Troubleshooting

### Common Issues

**Web scraping failures**
- Ensure you have the latest Chrome/Firefox browser
- Check your internet connection
- Some sites may have anti-scraping measures

**Module not found errors**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

**Authentication issues**
- Verify Supabase URL and key in environment variables
- Check that the Supabase project is properly configured

**CORS errors**
- Ensure backend is running on port 5000
- Check Flask-CORS is properly installed

**Frontend build issues**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Getting Help

Check the following places for additional support:

- Review the browser console for error messages
- Check the Flask server logs for backend errors
- Verify all environment variables are set correctly
- Ensure all prerequisite software is installed