# backend/auth_supabase.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import os
import secrets
from datetime import datetime, timedelta
import jwt
from dotenv import load_dotenv
import re
from supabase import create_client, Client

app = Flask(__name__)

load_dotenv() 

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")  # or SERVICE_KEY if required

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is required")


# Enhanced CORS configuration
CORS(app, 
     origins=["http://localhost:3000", "http://localhost:4028", "http://localhost:5173"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', secrets.token_hex(32))
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Supabase configuration with better error handling
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_ANON_KEY')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')

# Validate environment variables
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is required")
if not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_SERVICE_KEY environment variable is required")

# Initialize Supabase client
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print("✅ Supabase client initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize Supabase client: {e}")
    raise

def init_db():
    """Initialize database tables in Supabase"""
    try:
        # Test connection first
        result = supabase.table('users').select('id').limit(1).execute()
        print("✅ Database connection successful")
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Please ensure your Supabase credentials are correct and the tables exist")
        return False

def generate_jwt_token(user_id):
    """Generate JWT token for user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES'],
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')

def verify_jwt_token(token):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        user_id = verify_jwt_token(token)
        if user_id is None:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        # Get user data from Supabase
        try:
            result = supabase.table('users').select('*').eq('id', user_id).eq('is_active', True).execute()
            if not result.data:
                return jsonify({'error': 'User not found'}), 401
            
            request.current_user = result.data[0]
            return f(*args, **kwargs)
            
        except Exception as e:
            print(f"Database error in token_required: {e}")
            return jsonify({'error': 'Database error'}), 500
    
    return decorated

def validate_email(email):
    """Simple email validation"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Password validation"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Za-z]', password):
        return False, "Password must contain at least one letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, "Valid password"

@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    """Register a new user"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validation
        required_fields = ['fullName', 'email', 'password', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password
        is_valid, password_message = validate_password(password)
        if not is_valid:
            return jsonify({'error': password_message}), 400
        
        # Check if user already exists
        existing_user = supabase.table('users').select('id').eq('email', email).execute()
        
        if existing_user.data:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        password_hash = generate_password_hash(password)
        
        user_data = {
            'full_name': data['fullName'].strip(),
            'email': email,
            'password_hash': password_hash,
            'company': data.get('company', '').strip(),
            'role': data['role']
        }
        
        result = supabase.table('users').insert(user_data).execute()
        
        if not result.data:
            return jsonify({'error': 'Failed to create user'}), 500
        
        created_user = result.data[0]
        
        # Generate JWT token
        token = generate_jwt_token(created_user['id'])
        
        # Return user data (without password)
        user_response = {
            'id': created_user['id'],
            'fullName': created_user['full_name'],
            'email': created_user['email'],
            'company': created_user['company'],
            'role': created_user['role'],
            'avatarUrl': created_user.get('avatar_url'),
            'createdAt': created_user['created_at']
        }
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user_response,
            'token': token
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    """User login"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Get user from Supabase
        result = supabase.table('users').select('*').eq('email', email).eq('is_active', True).execute()
        
        if not result.data or not check_password_hash(result.data[0]['password_hash'], password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        user = result.data[0]
        
        # Update last login
        supabase.table('users').update({'last_login': datetime.now().isoformat()}).eq('id', user['id']).execute()
        
        # Generate JWT token
        token = generate_jwt_token(user['id'])
        
        # Return user data (without password)
        user_response = {
            'id': user['id'],
            'fullName': user['full_name'],
            'email': user['email'],
            'company': user['company'],
            'role': user['role'],
            'avatarUrl': user.get('avatar_url'),
            'lastLogin': user.get('last_login'),
            'createdAt': user['created_at']
        }
        
        return jsonify({
            'message': 'Login successful',
            'user': user_response,
            'token': token
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout():
    """User logout"""
    try:
        return jsonify({
            'message': 'Logout successful'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Logout failed: {str(e)}'}), 500

@app.route('/api/auth/profile', methods=['GET'])
@token_required
def get_profile():
    """Get current user profile"""
    try:
        user = request.current_user
        
        user_data = {
            'id': user['id'],
            'fullName': user['full_name'],
            'email': user['email'],
            'company': user['company'],
            'role': user['role'],
            'avatarUrl': user.get('avatar_url'),
            'lastLogin': user.get('last_login'),
            'createdAt': user['created_at']
        }
        
        return jsonify({
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

@app.route('/api/auth/verify-token', methods=['POST'])
def verify_token():
    """Verify JWT token"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'valid': False, 'error': 'No token provided'}), 401
        
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return jsonify({'valid': False, 'error': 'Invalid token format'}), 401
        
        user_id = verify_jwt_token(token)
        if user_id is None:
            return jsonify({'valid': False, 'error': 'Invalid or expired token'}), 401
        
        # Get user data from Supabase
        result = supabase.table('users').select('*').eq('id', user_id).eq('is_active', True).execute()
        
        if not result.data:
            return jsonify({'valid': False, 'error': 'User not found'}), 401
        
        user = result.data[0]
        
        user_data = {
            'id': user['id'],
            'fullName': user['full_name'],
            'email': user['email'],
            'company': user['company'],
            'role': user['role'],
            'avatarUrl': user.get('avatar_url')
        }
        
        return jsonify({
            'valid': True,
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 500

@app.route('/api/auth/health', methods=['GET'])
def auth_health():
    """Health check for auth service"""
    try:
        # Test Supabase connection
        supabase.table('users').select('count', count='exact').limit(0).execute()
        
        return jsonify({
            'status': 'healthy',
            'service': 'auth',
            'database': 'supabase',
            'timestamp': datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'auth',
            'database': 'supabase',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Root endpoint
@app.route('/')
def root():
    return jsonify({
        'message': 'Snapdeal Sentiment Analyzer Auth API',
        'status': 'running',
        'endpoints': {
            'register': '/api/auth/register',
            'login': '/api/auth/login',
            'logout': '/api/auth/logout',
            'profile': '/api/auth/profile',
            'verify-token': '/api/auth/verify-token',
            'health': '/api/auth/health'
        }
    })

if __name__ == '__main__':
    print("🚀 Initializing Snapdeal Sentiment Analyzer Auth Service...")
    
    # Check environment variables
    missing_vars = []
    if not SUPABASE_URL:
        missing_vars.append('SUPABASE_URL')
    if not SUPABASE_SERVICE_KEY:
        missing_vars.append('SUPABASE_SERVICE_KEY')
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please set these in your .env file")
        exit(1)
    
    # Initialize database
    if init_db():
        print("✅ Database connection verified")
    else:
        print("❌ Database connection failed")
        exit(1)
    
    print("\n📋 Available endpoints:")
    print("  POST /api/auth/register - Register new user")
    print("  POST /api/auth/login - User login")
    print("  POST /api/auth/logout - User logout")
    print("  GET  /api/auth/profile - Get user profile")
    print("  POST /api/auth/verify-token - Verify JWT token")
    print("  GET  /api/auth/health - Health check")
    print(f"\n🌐 Auth API is running on http://localhost:5001")
    print("🔧 CORS enabled for: http://localhost:3000, http://localhost:4028, http://localhost:5173")
    
    app.run(debug=True, host='0.0.0.0', port=5001)