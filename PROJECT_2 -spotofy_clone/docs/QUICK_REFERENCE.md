# 🎵 SPOTIFY CLONE - QUICK REFERENCE

## 📋 Pre-Flight Checklist

- [ ] MongoDB installed
- [ ] Python 3.8+ installed
- [ ] VS Code with Live Server extension

---

## ⚡ START HERE (Copy-Paste Ready)

### Terminal 1: Start MongoDB
```powershell
mongod
```
**Expected Output:** `Waiting for connections on port 27017`

### Terminal 2: Start Backend
```powershell
cd "c:\Users\raj\Documents\web-development\PROJECT_2 -spotofy_clone"
cd backend
pip install -r requirements.txt  # First time only
python -m uvicorn main:app --reload
```
**Expected Output:** `✅ MongoDB Connected Successfully` + `Uvicorn running on http://127.0.0.1:8000`

### Browser: Open Frontend
```
Open index.html with Live Server (Right-click → Open with Live Server)
OR
Open in browser: file:///c:/Users/raj/Documents/web-development/PROJECT_2%20-spotofy_clone/index.html
```

---

## 🧪 TEST IT

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Sign up" | Signup form appears |
| 2 | Fill form with new email | "Create Account" button ready |
| 3 | Click "Create Account" | Success message → Redirect to login |
| 4 | Login with same email | Success message → Redirect to dashboard |
| 5 | Check browser DevTools | Token saved in localStorage ✅ |

---

## 🗄️ CHECK MONGODB

### View Users Created

**Using MongoDB Shell:**
```powershell
mongosh
use spotify_clone
db.users.find()
```

**Using MongoDB Compass:**
1. Download: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Navigate to `spotify_clone` → `users`

---

## 🔗 Important URLs

| Purpose | URL |
|---------|-----|
| Frontend | `http://localhost:5500` (Live Server) |
| Backend API | `http://127.0.0.1:8000` |
| API Docs | `http://127.0.0.1:8000/docs` |
| Redoc | `http://127.0.0.1:8000/redoc` |

---

## 🚨 IF SOMETHING BREAKS

### "Cannot connect to backend"
```powershell
# Check if backend is running:
netstat -ano | findstr :8000

# Kill process on port 8000:
taskkill /PID <PID> /F

# Restart backend
```

### "MongoDB connection error"
```powershell
# Check if MongoDB is running:
netstat -ano | findstr :27017

# Start MongoDB:
mongod
```

### "ModuleNotFoundError"
```powershell
# Install dependencies:
pip install -r requirements.txt
```

---

## 📂 File Structure

```
PROJECT_2/
├── index.html              ← Home page
├── login.html              ← Login (form ID: loginForm)
├── signup.html             ← Signup (form ID: signupForm)
├── dashboard.html          ← User dashboard
├── js/
│   ├── auth.js             ← Authentication logic ⭐
│   └── script.js           ← Main script
├── css/
│   ├── style.css           ← Main styles
│   └── utility.css
└── backend/
    ├── main.py             ← FastAPI server ⭐
    ├── requirements.txt    ← Python packages
    └── mongodb → users collection
```

---

## 🔑 Key Variables (Frontend)

```javascript
// Stored in localStorage:
localStorage.getItem("token")      // JWT token
localStorage.getItem("username")   // User name
localStorage.getItem("email")      // User email
localStorage.getItem("is_logged_in") // true/false
```

---

## 🛠️ Environment Variables (Backend)

```python
# In main.py (⚠️ Change for production):
SECRET_KEY = "my_super_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

---

## 📞 Need Help?

1. Read: `SETUP_GUIDE.md`
2. Check: `IMPLEMENTATION_SUMMARY.md`
3. Run: `verify.bat`

---

## ✨ Success Indicators

✅ Backend says: `✅ MongoDB Connected Successfully`  
✅ Signup shows: `User created successfully`  
✅ Login shows: `Login successful ✅`  
✅ Redirect happens automatically  
✅ User data visible in MongoDB  

---

**Good to go! 🚀**
