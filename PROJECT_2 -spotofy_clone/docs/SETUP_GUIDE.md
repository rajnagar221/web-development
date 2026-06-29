# Spotify Clone - Setup Guide

## 🚀 Quick Start

### 1. Install MongoDB
MongoDB must be running on `localhost:27017`

**Windows:**
```powershell
# Download from https://www.mongodb.com/try/download/community
# Or install via Chocolatey:
choco install mongodb-community
```

**After installation, start MongoDB:**
```powershell
mongod
```

### 2. Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 3. Run Backend Server

```powershell
cd backend
python -m uvicorn main:app --reload
```

The backend will run on: `http://127.0.0.1:8000`

Check API docs at: `http://127.0.0.1:8000/docs`

### 4. Open Frontend

Open `index.html` in a browser (can use Live Server extension in VS Code)

---

## 📁 Project Structure

```
PROJECT_2/
├── index.html           # Home page
├── login.html           # Login page
├── signup.html          # Sign up page
├── dashboard.html       # Dashboard (user area)
├── css/
│   ├── style.css
│   └── utility.css
├── js/
│   ├── auth.js          # Authentication logic
│   └── script.js        # Main script
├── backend/
│   ├── main.py          # FastAPI server
│   └── requirements.txt  # Python dependencies
└── songs/               # Song data folders
```

---

## 🔐 API Endpoints

### Authentication

**Sign Up:**
```
POST /signup
Body: {
    "username": "user",
    "email": "user@example.com",
    "password": "password123"
}
Response: { "message": "User created successfully", "user_id": "..." }
```

**Login:**
```
POST /login
Body: {
    "email": "user@example.com",
    "password": "password123"
}
Response: {
    "access_token": "...",
    "token_type": "bearer",
    "username": "user",
    "message": "Login successful ✅"
}
```

**Get Current User:**
```
GET /me
Headers: Authorization: Bearer {token}
Response: {
    "username": "user",
    "email": "user@example.com",
    "user_id": "...",
    "last_login": "..."
}
```

**Check Login Status:**
```
GET /check-login?token={token}
Response: {
    "is_logged_in": true,
    "username": "user",
    "email": "user@example.com",
    "message": "User is logged in ✅"
}
```

**Logout:**
```
POST /logout
Response: { "message": "Logout successful ✅" }
```

---

## 💾 MongoDB Database

**Database Name:** `spotify_clone`  
**Collections:** `users`

**User Document Schema:**
```javascript
{
    "_id": ObjectId,
    "username": "user",
    "email": "user@example.com",
    "password": "hashed_password",
    "created_at": ISODate("2026-05-09T..."),
    "last_login": ISODate("2026-05-09T...")
}
```

---

## 🐛 Common Issues & Fixes

### Issue: "Server Error - Make sure backend is running"
- ✅ MongoDB must be running: `mongod`
- ✅ Backend must be running: `python -m uvicorn main:app --reload`
- ✅ Check if backend is on `http://127.0.0.1:8000`

### Issue: "User already exists"
- MongoDB is storing users - check with MongoDB Compass or mongo shell
- Clear users collection if needed:
```javascript
db.users.deleteMany({})
```

### Issue: "Invalid email or password"
- Check MongoDB for user document
- Ensure password is at least 6 characters
- Verify no spaces in email/password

### Issue: Token not working
- Tokens expire after 30 minutes
- Token is stored in `localStorage` - check browser DevTools
- Logout clears the token automatically

---

## 🧪 Testing

1. **Test Signup:**
   - Go to `signup.html`
   - Fill form and submit
   - Check MongoDB if user is created

2. **Test Login:**
   - Go to `login.html`
   - Use created account
   - Should redirect to `dashboard.html`

3. **Test API with Postman:**
   - Use endpoints listed above
   - Include token in Authorization header for protected routes

---

## 📝 Notes

- Passwords are hashed with bcrypt
- JWTs expire after 30 minutes
- All user data is stored in MongoDB
- Frontend stores token in localStorage
- CORS is enabled for development (disable for production)

---

## 🔧 Development Tips

- Use MongoDB Compass for easy database viewing
- Check browser console (F12) for errors
- Backend logs will show in terminal
- Update `SECRET_KEY` in production
- Use environment variables for sensitive data

---

**Happy Coding! 🎵**
