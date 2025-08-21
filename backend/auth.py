# backend/auth.py
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import sqlite3
import os
import secrets
from datetime import datetime, timedelta
import jwt

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', secrets.token_hex(32))
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Database setup
DATABASE = 'users.db'

def init_db():
    """Initialize the database"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            company TEXT,
            role TEXT NOT NULL,
            avatar_url TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

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
        
        # Get user data
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE id = ? AND is_active = 1', (user_id,)).fetchone()
        conn.close()
        
        if not user:
            return jsonify({'error': 'User not found'}), 401
        
        request.current_user = dict(user)
        return f(*args, **kwargs)
    
    return decorated

def validate_email(email):
    """Simple email validation"""
    import re
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

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
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
        conn = get_db_connection()
        existing_user = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
        
        if existing_user:
            conn.close()
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        password_hash = generate_password_hash(password)
        
        cursor = conn.execute('''
            INSERT INTO users (full_name, email, password_hash, company, role)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['fullName'].strip(),
            email,
            password_hash,
            data.get('company', '').strip(),
            data['role']
        ))
        
        user_id = cursor.lastrowid
        conn.commit()
        
        # Get the created user
        user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        conn.close()
        
        # Generate JWT token
        token = generate_jwt_token(user_id)
        
        # Return user data (without password)
        user_data = {
            'id': user['id'],
            'fullName': user['full_name'],
            'email': user['email'],
            'company': user['company'],
            'role': user['role'],
            'avatarUrl': user['avatar_url'],
            'createdAt': user['created_at']
        }
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user_data,
            'token': token
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Get user from database
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE email = ? AND is_active = 1', (email,)).fetchone()
        
        if not user or not check_password_hash(user['password_hash'], password):
            conn.close()
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Update last login
        conn.execute('UPDATE users SET last_login = ? WHERE id = ?', (datetime.now(), user['id']))
        conn.commit()
        conn.close()
        
        # Generate JWT token
        token = generate_jwt_token(user['id'])
        
        # Return user data (without password)
        user_data = {
            'id': user['id'],
            'fullName': user['full_name'],
            'email': user['email'],
            'company': user['company'],
            'role': user['role'],
            'avatarUrl': user['avatar_url'],
            'lastLogin': user['last_login'],
            'createdAt': user['created_at']
        }
        
        return jsonify({
            'message': 'Login successful',
            'user': user_data,
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout():
    """User logout"""
    try:
        # In a stateless JWT system, logout is mainly handled client-side
        # But we can blacklist the token or clean up any server-side data
        
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
            'avatarUrl': user['avatar_url'],
            'lastLogin': user['last_login'],
            'createdAt': user['created_at']
        }
        
        return jsonify({
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get profile: {str(e)}'}), 500

@app.route('/api/auth/profile', methods=['PUT'])
@token_required
def update_profile():
    """Update user profile"""
    try:
        data = request.get_json()
        user = request.current_user
        
        # Fields that can be updated
        updatable_fields = {
            'fullName': 'full_name',
            'company': 'company',
            'role': 'role',
            'avatarUrl': 'avatar_url'
        }
        
        update_data = {}
        for frontend_field, db_field in updatable_fields.items():
            if frontend_field in data:
                update_data[db_field] = data[frontend_field]
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Build update query
        set_clause = ', '.join([f'{field} = ?' for field in update_data.keys()])
        values = list(update_data.values()) + [datetime.now(), user['id']]
        
        conn = get_db_connection()
        conn.execute(f'''
            UPDATE users 
            SET {set_clause}, updated_at = ?
            WHERE id = ?
        ''', values)
        conn.commit()
        
        # Get updated user data
        updated_user = conn.execute('SELECT * FROM users WHERE id = ?', (user['id'],)).fetchone()
        conn.close()
        
        user_data = {
            'id': updated_user['id'],
            'fullName': updated_user['full_name'],
            'email': updated_user['email'],
            'company': updated_user['company'],
            'role': updated_user['role'],
            'avatarUrl': updated_user['avatar_url'],
            'lastLogin': updated_user['last_login'],
            'createdAt': updated_user['created_at'],
            'updatedAt': updated_user['updated_at']
        }
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500

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
        
        # Get user data
        conn = get_db_connection()
        user = conn.execute('SELECT * FROM users WHERE id = ? AND is_active = 1', (user_id,)).fetchone()
        conn.close()
        
        if not user:
            return jsonify({'valid': False, 'error': 'User not found'}), 401
        
        user_data = {
            'id': user['id'],
            'fullName': user['full_name'],
            'email': user['email'],
            'company': user['company'],
            'role': user['role'],
            'avatarUrl': user['avatar_url']
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
    return jsonify({
        'status': 'healthy',
        'service': 'auth',
        'timestamp': datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    print("Initializing user authentication database...")
    init_db()
    print("Starting User Authentication API...")
    print("Available endpoints:")
    print("  POST /api/auth/register - Register new user")
    print("  POST /api/auth/login - User login")
    print("  POST /api/auth/logout - User logout")
    print("  GET  /api/auth/profile - Get user profile")
    print("  PUT  /api/auth/profile - Update user profile")
    print("  POST /api/auth/verify-token - Verify JWT token")
    print("  GET  /api/auth/health - Health check")
    print("\nAuth API is running on http://localhost:5001")
    
    app.run(debug=True, host='0.0.0.0', port=5001)