# Sentiment Analysis App

A full-stack application for scraping product reviews, performing sentiment analysis using NLP and ML models, and visualizing the results in an interactive dashboard.

## Features

- **Product Scraping**: Extract product information from multiple categories
- **Review Extraction**: Scrape customer reviews using advanced techniques
- **Sentiment Analysis**: Analyze review sentiment with enhanced accuracy using multiple models
- **Web Interface**: User-friendly React-based web application
- **Batch Processing**: Process multiple categories automatically
- **Comprehensive Reports**: Detailed sentiment analysis reports with visualizations
- **User Authentication**: Secure login and registration system
- **Real-time Processing**: Live progress tracking during analysis

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Primary Red | `#e40046` | Primary buttons, accents |
| Soft Red | `#ef4444` | Secondary elements |
| Black | `#000000` | Text, borders |
| Light Black (10%) | `#0000001a` | Subtle backgrounds |
| Navy Black | `#06081fe0` | Dark backgrounds |
| Dark Gray | `#333333` | Secondary text |
| Medium Gray | `#5a5a59` | Disabled elements |
| White | `#ffffff` | Backgrounds, text on dark |
| Rating Yellow | `#ffc315` | Star ratings, highlights |
| Positive Green | `#6ee7b7` | Positive sentiment |
| Negative Red | `#fca5a5` | Negative sentiment |
| Neutral Gray | `#d1d5db` | Neutral sentiment |

## Architecture

```
sentiment-analysis-app/
├── backend/          # Flask API with scraping & analysis
└── frontend/         # React Vite application
```

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Chrome/Firefox browser (for web scraping)

## Backend Setup

### 1. Navigate to backend directory

```bash
cd backend
```

### 2. Create and activate virtual environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Alternative (Snapdeal environment):**
```powershell
.\env_snapdeal\Scripts\Activate.ps1
where python
python --version
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

**Additional ML/NLP libraries (if needed):**
```bash
pip install transformers datasets torch scikit-learn pandas
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

## Frontend Setup

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

## Tech Stack

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
- **Recharts** - Data visualization
- **Axios** - API communication
- **React Router** - Navigation

## Database Setup

The application uses Supabase for authentication and data storage.

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and API key from Settings > API
4. Update the environment variables in both backend and frontend
5. Run the SQL schema from `supabase_schema.sql` in the Supabase SQL editor

## Configuration

### Backend Configuration

Update settings in `backend/config.py`:

- Scraping timeouts and retries
- Sentiment analysis model preferences
- File storage paths
- API rate limiting

### Frontend Configuration

Update API endpoints in `frontend/src/services/api.js` if different from default:

```javascript
const API_BASE_URL = 'http://localhost:5000';
```

## Testing the Application

### 1. Start both servers

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux
# or (Snapdeal environment)
.\env_snapdeal\Scripts\Activate.ps1  # Windows PowerShell

python app.py
```

**Terminal 2 - Frontend:**
```bash
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

## Project Structure

### Complete File Tree

```
sentiment-analysis-app/
├── backend/
│   ├── analyzer/
│   │   └── sentiment_analyzer.py    # Core sentiment analysis logic
│   ├── auth_env/                     # Authentication virtual environment
│   │   ├── Lib/
│   │   │   └── site-packages/       # Python packages
│   │   ├── Scripts/
│   │   │   ├── Activate.ps1
│   │   │   ├── activate
│   │   │   ├── activate.bat
│   │   │   ├── deactivate.bat
│   │   │   ├── pip.exe
│   │   │   └── python.exe
│   │   └── pyvenv.cfg
│   ├── data/                         # Scraped data storage
│   │   ├── products_*.json          # Product data files
│   │   └── reviews_*.json           # Review data files
│   ├── env_snapdeal/                # Snapdeal scraping environment
│   ├── sentiment_model/             # Pre-trained sentiment model
│   │   ├── config.json
│   │   ├── model.safetensors
│   │   ├── tokenizer.json
│   │   └── vocab.txt
│   ├── .env                         # Environment variables
│   ├── app.py                       # Main Flask application
│   ├── auth_supabase.py            # Supabase authentication
│   ├── config.py                    # Configuration settings
│   ├── requirements.txt             # Python dependencies
│   ├── scrape_products.py          # Product scraping logic
│   ├── sentiment_analysis.py       # Sentiment orchestration
│   └── server.js                    # Node server (if needed)
│
├── frontend/
│   ├── public/
│   │   ├── assets/
│   │   │   └── images/
│   │   │       └── no_image.png
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Checkbox.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── ProfileDropdown.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   └── UserProfile.jsx
│   │   │   ├── AppIcon.jsx
│   │   │   ├── AppImage.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── ScrollToTop.jsx
│   │   ├── pages/
│   │   │   ├── product-search-selection/
│   │   │   │   ├── components/
│   │   │   │   │   ├── BulkActionBar.jsx
│   │   │   │   │   ├── ProductCard.jsx
│   │   │   │   │   ├── ProductGrid.jsx
│   │   │   │   │   └── SearchBar.jsx
│   │   │   │   └── index.jsx
│   │   │   ├── reports-analytics/
│   │   │   │   └── index.jsx        # Reports & Analytics page
│   │   │   ├── sentiment-analysis-processing/
│   │   │   │   ├── components/
│   │   │   │   │   ├── CancelConfirmationModal.jsx
│   │   │   │   │   ├── DetailedProgress.jsx
│   │   │   │   │   ├── LivePreview.jsx
│   │   │   │   │   ├── OverallProgress.jsx
│   │   │   │   │   ├── ProcessingActions.jsx
│   │   │   │   │   ├── ProcessingHeader.jsx
│   │   │   │   │   └── ProcessingQueue.jsx
│   │   │   │   └── index.jsx
│   │   │   ├── user-authentication/
│   │   │   │   ├── components/
│   │   │   │   │   ├── AuthFooter.jsx
│   │   │   │   │   ├── AuthHeader.jsx
│   │   │   │   │   ├── AuthTabs.jsx
│   │   │   │   │   ├── LoginForm.jsx
│   │   │   │   │   └── RegisterForm.jsx
│   │   │   │   └── index.jsx
│   │   │   ├── user-profile-settings/
│   │   │   │   └── index.jsx
│   │   │   ├── Home.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js              # API client
│   │   │   ├── authService.js      # Authentication service
│   │   │   └── sentimentService.js # Sentiment analysis service
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   └── tailwind.css
│   │   ├── utils/
│   │   │   └── cn.js               # Utility functions
│   │   ├── App.jsx                 # Main app component
│   │   ├── Routes.jsx              # Route definitions
│   │   └── index.jsx               # Entry point
│   ├── .env                        # Environment variables
│   ├── favicon.ico
│   ├── index.html
│   ├── jsconfig.json
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.mjs
│
├── .gitattributes
├── .gitignore
└── README.md
```

### Backend Structure (Detailed)

```
backend/
├── analyzer/                 # Sentiment analysis modules
├── data/                    # JSON data storage
├── auth_env/                # Virtual environment
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
│   │   ├── ui/             # UI primitives
│   │   └── AppIcon.jsx     # Icon component
│   ├── pages/              # Application pages
│   │   ├── product-search-selection/    # Product discovery
│   │   ├── sentiment-analysis-processing/ # Analysis workflow
│   │   ├── reports-analytics/           # Reports & Analytics
│   │   ├── user-authentication/         # Login/register
│   │   └── user-profile-settings/       # User management
│   ├── services/           # API services
│   ├── styles/             # CSS stylesheets
│   └── utils/              # Utility functions
└── public/                 # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products/categories` - Get available categories
- `POST /api/scrape/products` - Scrape products by category
- `GET /api/products` - Get scraped products

### Sentiment Analysis
- `POST /api/analyze/sentiment` - Analyze product reviews
- `GET /api/analysis/results/:id` - Get analysis results
- `POST /api/export/report` - Export analysis report

## Troubleshooting

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
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `npm run dev -- --force`

### Getting Help

- Check the browser console for error messages
- Check the Flask server logs for backend errors
- Verify all environment variables are set correctly
- Ensure all prerequisite software is installed

## Features in Detail

### Product Search & Selection
- Multi-category product scraping
- Real-time scraping progress
- Product filtering and search
- Batch selection for analysis

### Sentiment Analysis Processing
- Queue-based processing system
- Real-time progress tracking
- Multi-model sentiment analysis
- Confidence scoring

### Reports & Analytics
- Interactive dashboard with charts
- Sentiment distribution visualization
- Trend analysis over time
- Key insights and recommendations
- Export functionality (CSV, JSON, PDF)

### User Management
- Secure authentication via Supabase
- Profile management
- Analysis history
- Saved reports

## Export Formats

The application supports multiple export formats:

- **CSV**: Spreadsheet-compatible data
- **JSON**: Structured data for programmatic use
- **PDF**: Formatted reports (exported as .txt)

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

## Acknowledgments

- Built with Flask and React
- Uses Hugging Face Transformers for NLP
- Powered by Supabase for authentication
- UI components from shadcn/ui