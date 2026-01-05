# GitHub Copilot Instructions

This is a MERN Stack Healthcare Platform - MediCare, an AI-Powered Smart Drug Adherence & Remote Care Platform.

## Project Overview

**MediCare** is a comprehensive healthcare platform built with:
- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT with bcrypt
- **Architecture**: MERN Stack with role-based access control

## Key Features Implemented

✅ **Patient/User Features**
- Medicine management and tracking
- Adherence monitoring
- Doctor messaging
- Medicine store access

✅ **Doctor Features**
- Patient message inbox
- Send recommendations
- Patient adherence tracking

✅ **Admin Features**
- Medicine upload and management
- Inventory control
- Patient-to-doctor assignments

✅ **Security**
- JWT authentication
- Bcrypt password hashing
- Role-based access control

## Project Structure

```
code loop/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   ├── server.js        # Express server
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── services/    # API client
│   │   ├── context/     # Auth context
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
├── README.md            # Full documentation
├── QUICK_START.md       # Quick setup guide
└── setup.bat/.sh        # Installation script
```

## Database Collections

- **Users** - Patients, doctors, admins
- **Medicines** - Medicine catalog
- **UserMedicines** - User's prescribed medicines
- **AdherenceLogs** - Medicine intake records
- **Messages** - Doctor-patient communication
- **DoctorPatient** - Assignment relationships

## API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

### Users
- `GET /api/users`
- `GET /api/users/profile/:id`
- `PUT /api/users/profile/:id`

### Medicines
- `GET /api/medicines/store`
- `POST /api/medicines/add-to-user`
- `POST /api/medicines/upload` (Admin)

### Adherence
- `POST /api/adherence/log`
- `GET /api/adherence/stats/:userId`

### Messages
- `POST /api/messages/send`
- `GET /api/messages/received`

### Admin
- `POST /api/admin/assign-patient`
- `GET /api/admin/medicines`

## Getting Started

1. Run setup script (setup.bat for Windows, setup.sh for Mac/Linux)
2. Start backend: `cd backend && npm start`
3. Start frontend: `cd frontend && npm start`
4. Open http://localhost:3000

## Test Credentials

- User: user@test.com / password123
- Doctor: doctor@test.com / password123
- Admin: admin@test.com / password123

## Development Notes

- Backend runs on port 5000
- Frontend runs on port 3000
- MongoDB Atlas is already configured
- JWT tokens expire in 7 days
- Passwords are hashed with bcrypt

## Future Enhancements

- Mobile app (React Native)
- AI health diagnostics
- Video consultations
- Wearable integration
- Multi-language support

---

For complete documentation, see README.md
For quick setup, see QUICK_START.md
