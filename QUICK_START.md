# ⚡ QUICK START GUIDE

## 🚀 Start MediCare Platform in 5 Minutes

### 1️⃣ Install Dependencies

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
bash setup.sh
```

Or manually:
```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 2️⃣ Configure MongoDB

Your MongoDB connection string is already in `backend/.env`:
```
mongodb+srv://nandukumar9980:kumar456@cluster0.ecnna5x.mongodb.net/?appName=Cluster0
```

✅ No additional setup needed!

### 3️⃣ Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
✅ Backend running on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
✅ Frontend running on http://localhost:3000

### 4️⃣ Access the Platform

Open your browser and go to: **http://localhost:3000**

## 🔐 Test Accounts

```
PATIENT:
- Email: user@test.com
- Password: password123
- Role: User

DOCTOR:
- Email: doctor@test.com
- Password: password123
- Role: Doctor

ADMIN:
- Email: admin@test.com
- Password: password123
- Role: Admin
```

## 📋 Features to Try

### As a Patient (User):
1. ✅ Register/Login
2. ✅ Browse Medicine Store
3. ✅ Add medicines to your profile
4. ✅ Mark medicines as Taken/Missed
5. ✅ Send messages to doctor

### As a Doctor:
1. ✅ View patient messages
2. ✅ Send medical recommendations
3. ✅ Monitor assigned patients

### As an Admin:
1. ✅ Upload new medicines
2. ✅ Manage medicine inventory
3. ✅ Assign patients to doctors

## 🆘 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify MongoDB connection string
- Check all dependencies installed: `npm install`

### Frontend won't start
- Check if port 3000 is available
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node -v` (should be v14+)

### API errors
- Ensure backend is running on port 5000
- Check browser console for error messages
- Verify JWT token in localStorage

## 📁 Project Structure

```
code loop/
├── backend/              # Node.js + Express API
├── frontend/             # React web app
├── setup.bat            # Windows setup script
├── setup.sh             # Mac/Linux setup script
└── README.md            # Full documentation
```

## 🎯 Next Steps

1. **Explore the UI** - Click through all dashboards
2. **Test the API** - Use Postman/Thunder Client
3. **Add Sample Data** - Create medicines and users
4. **Deploy** - Use Vercel (frontend) & Railway (backend)

## 📞 Need Help?

Check the main `README.md` for:
- Complete API documentation
- Database schema details
- Deployment instructions
- Security features

## ✨ Key Technologies Used

- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: Node.js, Express, JWT
- **Database**: MongoDB Atlas
- **Authentication**: JWT + Bcrypt

---

**Happy Coding! 🎉**
