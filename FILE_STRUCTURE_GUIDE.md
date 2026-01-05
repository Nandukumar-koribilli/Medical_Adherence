# 🗂️ Complete File Structure & Component Guide

## Project Root Files

```
code loop/
│
├── 📄 README.md                          # Main project documentation
├── 📄 QUICK_START.md                     # 5-minute setup guide
├── 📄 ARCHITECTURE.md                    # System architecture & design
├── 📄 API_DOCUMENTATION.md               # Complete API reference
├── 📄 PROJECT_SETUP_COMPLETE.md          # Setup completion guide
├── 📄 PLATFORM_OVERVIEW.md               # Project summary (this file)
│
├── 🛠️ setup.bat                           # Windows setup script
├── 🛠️ setup.sh                            # Mac/Linux setup script
│
└── .github/
    └── copilot-instructions.md           # Copilot instructions
```

---

## Backend Structure (`/backend`)

### Core Files

| File | Purpose |
|------|---------|
| `server.js` | Express server setup, route mounting, MongoDB connection |
| `package.json` | Node dependencies (Express, Mongoose, JWT, Bcrypt) |
| `.env` | MongoDB URI, JWT secret, port configuration |
| `README.md` | Backend documentation |
| `.gitignore` | Node modules and files to ignore |

### Models (`/backend/models`)

| File | Purpose | Collections |
|------|---------|-------------|
| `User.js` | User schema (patient/doctor/admin) | Users |
| `Medicine.js` | Medicine catalog schema | Medicines |
| `UserMedicine.js` | User's prescribed medicines | UserMedicines |
| `AdherenceLog.js` | Medicine intake tracking | AdherenceLogs |
| `Message.js` | Doctor-patient messages | Messages |
| `DoctorPatient.js` | Doctor-patient relationships | DoctorPatient |

### Routes (`/backend/routes`)

| File | Endpoints | Methods |
|------|-----------|---------|
| `auth.js` | /register, /login | POST |
| `users.js` | /users, /profile, /doctors | GET, PUT |
| `medicines.js` | /store, /my-medicines, /upload | GET, POST, DELETE |
| `adherence.js` | /log, /user-logs, /stats | GET, POST |
| `messages.js` | /send, /received, /sent, /:id/read | GET, POST, PUT |
| `admin.js` | /assign-patient, /medicines | GET, POST, PUT |

### Middleware (`/backend/middleware`)

| File | Purpose |
|------|---------|
| `auth.js` | JWT verification and role-based authorization |

---

## Frontend Structure (`/frontend`)

### Root Files

| File | Purpose |
|------|---------|
| `package.json` | React dependencies and scripts |
| `.gitignore` | Build outputs and modules |
| `tailwind.config.js` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS plugins |
| `README.md` | Frontend documentation |

### Public Files (`/public`)

| File | Purpose |
|------|---------|
| `index.html` | HTML entry point |

### Source Files (`/src`)

| File | Purpose |
|------|---------|
| `App.js` | Main app with routing |
| `index.js` | React DOM render |
| `index.css` | Global styles |

### Pages (`/src/pages`)

| File | Purpose | Features |
|------|---------|----------|
| `LandingPage.js` | Welcome/home page | Feature showcase, CTA buttons |
| `Register.js` | User registration | Form validation, role selection |
| `Login.js` | User login | Credentials validation |
| `UserDashboard.js` | Patient dashboard | Medicine store, my medicines, adherence tracking |
| `DoctorDashboard.js` | Doctor dashboard | Patient messages, send recommendations |
| `AdminDashboard.js` | Admin dashboard | Medicine management, patient assignment |

### Services (`/src/services`)

| File | Purpose | Functions |
|------|---------|-----------|
| `api.js` | API client | 30+ API methods using Axios |

### Context (`/src/context`)

| File | Purpose | State |
|------|---------|-------|
| `AuthContext.js` | Authentication state | user, token, login(), logout() |

### Components (`/src/components`)

**Note**: Component folder prepared for future expansion. Currently pages handle UI.

---

## Database Schema Details

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  role: String (enum: ['user', 'doctor', 'admin']),
  phone: String,
  age: Number,
  address: String,
  profilePicture: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Medicines Collection
```javascript
{
  name: String,
  dosage: String,
  frequency: String,
  description: String,
  price: Number,
  image: String,
  manufacturer: String,
  uploadedBy: ObjectId (ref: User),
  category: String,
  inStock: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### UserMedicines Collection
```javascript
{
  userId: ObjectId (ref: User),
  medicineId: ObjectId (ref: Medicine),
  dosage: String,
  frequency: String,
  startDate: Date,
  endDate: Date,
  timeSlots: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### AdherenceLogs Collection
```javascript
{
  userId: ObjectId (ref: User),
  medicineId: ObjectId (ref: Medicine),
  date: Date,
  time: String,
  status: String (enum: ['taken', 'missed', 'snoozed']),
  dosage: String,
  notes: String,
  createdAt: Date
}
```

### Messages Collection
```javascript
{
  senderId: ObjectId (ref: User),
  receiverId: ObjectId (ref: User),
  subject: String,
  message: String,
  isRead: Boolean,
  attachments: [String],
  messageType: String (enum: ['text', 'prescription', 'alert', 'recommendation']),
  createdAt: Date,
  updatedAt: Date
}
```

### DoctorPatient Collection
```javascript
{
  doctorId: ObjectId (ref: User),
  patientId: ObjectId (ref: User),
  assignedDate: Date,
  notes: String,
  status: String (enum: ['active', 'inactive']),
  riskLevel: String (enum: ['low', 'medium', 'high']),
  createdAt: Date
}
```

---

## API Route Summary

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Routes
- `GET /api/users` - Get all users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile/:id` - Update profile
- `GET /api/users/doctors` - Get all doctors

### Medicine Routes
- `GET /api/medicines/store` - Get medicine store
- `POST /api/medicines/add-to-user` - Add medicine to user
- `GET /api/medicines/my-medicines` - Get user's medicines
- `POST /api/medicines/upload` - Upload medicine (Admin)
- `DELETE /api/medicines/:id` - Delete medicine (Admin)

### Adherence Routes
- `POST /api/adherence/log` - Log adherence
- `GET /api/adherence/user-logs` - Get user logs
- `GET /api/adherence/stats/:userId` - Get statistics

### Message Routes
- `POST /api/messages/send` - Send message
- `GET /api/messages/received` - Get received messages
- `GET /api/messages/sent` - Get sent messages
- `PUT /api/messages/:id/read` - Mark as read

### Admin Routes
- `POST /api/admin/assign-patient` - Assign patient to doctor
- `GET /api/admin/medicines` - Get all medicines
- `PUT /api/admin/medicines/:id` - Update medicine stock

---

## Page Features Detail

### Landing Page (`LandingPage.js`)
✅ Features overview
✅ Tech stack showcase
✅ Call-to-action buttons
✅ Responsive design
✅ Feature cards with icons

### Register Page (`Register.js`)
✅ Full name input
✅ Email field
✅ Phone number
✅ Role selection dropdown
✅ Password confirmation
✅ Form validation
✅ Automatic login after registration
✅ Link to login page

### Login Page (`Login.js`)
✅ Email field
✅ Password field
✅ Error messages
✅ Loading state
✅ Test credentials display
✅ Link to register page

### User Dashboard (`UserDashboard.js`)
✅ Medicine store browsing
✅ Add medicines from store
✅ My medicines section
✅ Quick actions (Taken/Missed)
✅ Adherence logging
✅ Tab navigation
✅ Welcome message
✅ Responsive grid layout

### Doctor Dashboard (`DoctorDashboard.js`)
✅ Patient message inbox
✅ Message list with sender details
✅ Send recommendation form
✅ Patient selection dropdown
✅ Message text area
✅ Tab navigation
✅ Message timestamps

### Admin Dashboard (`AdminDashboard.js`)
✅ Medicine management table
✅ Add new medicine form
✅ Medicine upload with all fields
✅ Stock toggle buttons
✅ Assign patient form
✅ Doctor/patient selection
✅ Three-tab interface
✅ Inventory control

---

## Component Architecture

### App.js Structure
```
App
├── Router
│   ├── AuthProvider
│   │   └── Routes
│   │       ├── Public Routes
│   │       │   ├── LandingPage
│   │       │   ├── Register
│   │       │   └── Login
│   │       └── Protected Routes
│   │           ├── UserDashboard (user role)
│   │           ├── DoctorDashboard (doctor role)
│   │           └── AdminDashboard (admin role)
```

---

## Key Technologies Used

### Backend Stack
- Express.js 4.18.2
- Mongoose 7.0.0
- Bcryptjs 2.4.3
- Jsonwebtoken 9.0.0
- Cors 2.8.5
- Dotenv 16.0.3
- Nodemailer 6.9.1

### Frontend Stack
- React 18.2.0
- React Router DOM 6.8.0
- Tailwind CSS 3.2.4
- Axios 1.3.2
- React Icons 4.7.1

---

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend
- Uses proxy in package.json for API calls
- Automatic CORS handling

---

## Configuration Files

### Backend
- `.env` - Environment variables
- `.gitignore` - Git ignore rules
- `package.json` - Dependencies

### Frontend
- `tailwind.config.js` - Tailwind CSS config
- `postcss.config.js` - PostCSS plugins
- `.gitignore` - Git ignore rules
- `package.json` - Dependencies

---

## Script Commands

### Backend
```bash
npm start          # Start development server
npm install        # Install dependencies
```

### Frontend
```bash
npm start          # Start React dev server
npm build          # Build for production
npm install        # Install dependencies
```

---

## Development Workflow

1. **Backend Development**
   - Edit models, routes, middleware
   - Test endpoints with Postman/cURL
   - Check MongoDB Atlas

2. **Frontend Development**
   - Edit React components
   - Test with browser DevTools
   - Check Network tab for API calls

3. **Testing**
   - Login with test credentials
   - Try all features
   - Check browser console for errors
   - Monitor backend logs

---

## Deployment Checklist

- [ ] Update JWT_SECRET in .env
- [ ] Set NODE_ENV to production
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Build frontend: `npm run build`
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway/Render
- [ ] Test all endpoints
- [ ] Monitor logs for errors

---

## Code Quality Features

✅ Modular component structure
✅ Separation of concerns
✅ Reusable API service
✅ Error handling throughout
✅ Loading states
✅ Form validation
✅ Responsive design
✅ Security best practices

---

## Documentation Files

| File | Content |
|------|---------|
| README.md | Complete project overview |
| QUICK_START.md | 5-minute setup guide |
| ARCHITECTURE.md | System design |
| API_DOCUMENTATION.md | API reference |
| PROJECT_SETUP_COMPLETE.md | Setup guide |
| PLATFORM_OVERVIEW.md | Project summary |

---

This comprehensive guide provides complete insight into the MediCare platform structure, ensuring easy navigation and maintenance.

**Happy Development!** 🚀
