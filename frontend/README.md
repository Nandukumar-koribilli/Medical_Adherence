# Frontend Documentation

## Directory Structure

```
frontend/
├── public/                  # Static files
│   └── index.html
├── src/
│   ├── pages/             # Page components
│   │   ├── LandingPage.js
│   │   ├── Register.js
│   │   ├── Login.js
│   │   ├── UserDashboard.js
│   │   ├── DoctorDashboard.js
│   │   └── AdminDashboard.js
│   ├── components/        # Reusable components
│   ├── services/          # API calls
│   │   └── api.js
│   ├── context/           # React Context
│   │   └── AuthContext.js
│   ├── App.js            # Main app component
│   ├── index.js          # Entry point
│   └── index.css         # Global styles
├── package.json
└── tailwind.config.js
```

## Pages

### Landing Page
- Welcome page with feature overview
- Call-to-action buttons
- Tech stack information

### Register
- User registration form
- Role selection (User/Doctor/Admin)
- Form validation

### Login
- User login form
- Credential validation
- Test credentials available

### User Dashboard
- Medicine store browsing
- Add medicines from store
- Track medicine intake
- View adherence stats

### Doctor Dashboard
- View patient messages
- Send recommendations
- Monitor assigned patients

### Admin Dashboard
- Add new medicines
- Manage medicine inventory
- Assign patients to doctors
- View all medicines

## Authentication Flow

1. User registers or logs in
2. Token stored in localStorage
3. AuthContext manages user state
4. Protected routes check authentication
5. Automatic logout on token expiry

## Getting Started

```bash
cd frontend
npm install
npm start
```

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
