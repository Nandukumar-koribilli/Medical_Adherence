# 🏥 MediCare Architecture & Features Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT LAYER (Port 3000)              │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Landing Page │  │  Auth Pages  │  │  Dashboards  │   │
│  │  - Home      │  │  - Register  │  │  - User      │   │
│  │  - Features  │  │  - Login     │  │  - Doctor    │   │
│  │  - CTA       │  │              │  │  - Admin     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
│              React + Tailwind CSS + Axios               │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼─────────────────────────────────┐
│                   API LAYER (Port 5000)                  │
│                  Express.js Routes                       │
│                                                          │
│  ┌─────────────┬─────────────┬──────────────┬──────────┐ │
│  │Auth Routes  │User Routes  │Medicine Routes │Messages│ │
│  │             │             │  & Adherence  │ Routes │ │
│  │ -register   │ -profile    │  -store       │ -send  │ │
│  │ -login      │ -doctors    │  -add         │ -receive
│  │             │             │  -upload      │        │ │
│  └─────────────┴─────────────┴──────────────┴────────┘ │
│                                                          │
│                 JWT Authentication                      │
│              Role-Based Access Control                  │
└────────────────────────┬─────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼─────────────────────────────────┐
│            DATABASE LAYER (MongoDB Atlas)                │
│                                                          │
│  ┌──────────┬──────────────┬──────────────┬──────────┐   │
│  │ Users    │ Medicines    │ UserMedicines│Messages  │   │
│  │          │              │              │          │   │
│  │ -User    │ -Medicine    │ -User ID     │ -Sender  │   │
│  │ -Doctor  │ -Price       │ -Medicine ID │ -Receiver│   │
│  │ -Admin   │ -Dosage      │ -Timeslots   │ -Content │   │
│  │          │ -Stock       │              │          │   │
│  └──────────┴──────────────┴──────────────┴────────┘   │
│                                                          │
│  ┌──────────────────┬──────────────────────────────┐   │
│  │ AdherenceLogs    │ DoctorPatient                │   │
│  │                  │                              │   │
│  │ -User ID         │ -Doctor ID                   │   │
│  │ -Medicine ID     │ -Patient ID                  │   │
│  │ -Status (T/M/S)  │ -Risk Level                  │   │
│  │ -Date & Time     │ -Status                      │   │
│  └──────────────────┴──────────────────────────────┘   │
│                                                          │
│              Cloud Hosted - Always Available            │
└──────────────────────────────────────────────────────────┘
```

## User Roles & Permissions

### 👤 Patient/User Role
**Permissions:**
- Register and create account
- Browse medicine store
- Add medicines from store
- Track medicine intake (taken/missed/snoozed)
- View adherence statistics
- Send messages to assigned doctor
- View doctor recommendations
- Update own profile

**Dashboard Features:**
- Medicine store with search
- My medicines with quick actions
- Adherence tracker with graphs
- Message center

### 👨‍⚕️ Doctor Role
**Permissions:**
- Register as doctor
- View assigned patients
- Receive messages from patients
- Send medical recommendations
- Track patient adherence
- View patient details
- Identify high-risk patients

**Dashboard Features:**
- Patient message inbox
- Patient list with status
- Adherence tracking per patient
- Recommendation panel
- Message history

### ⚙️ Admin Role
**Permissions:**
- Register as admin
- Upload medicines with details
- Manage medicine inventory
- Toggle medicine stock status
- Assign patients to doctors
- View all medicines
- View all users
- System analytics

**Dashboard Features:**
- Medicine management table
- Medicine upload form
- Patient-doctor assignment
- Inventory control
- System statistics

## Key Features By Module

### 1. Authentication Module
- User registration with role selection
- Secure login with JWT
- Password hashing with bcrypt
- Token expiration (7 days)
- Protected routes

### 2. Medicine Management Module
- Admin can upload medicines with:
  - Name, dosage, frequency
  - Description, price
  - Manufacturer, category
  - Stock status
- Users can browse and add medicines
- Admin can toggle stock status
- Price management

### 3. Adherence Tracking Module
- Users can log medicine intake:
  - Status: Taken, Missed, Snoozed
  - Date and time recording
  - Custom notes
- Automatic adherence calculation:
  - Total doses
  - Taken doses
  - Missed doses
  - Adherence percentage

### 4. Messaging System Module
- User to doctor messaging
- Doctor to user recommendations
- Message types:
  - Text messages
  - Prescriptions
  - Alerts
  - Recommendations
- Message read status
- Message history

### 5. Doctor-Patient Assignment Module
- Admin assigns patients to doctors
- One patient can have multiple doctors
- Risk level tracking (low/medium/high)
- Assignment status management

## Data Flow Examples

### Medicine Addition Flow
```
User → Browse Store → Select Medicine → Add to Profile → 
→ Backend stores in UserMedicine collection → 
→ User sees medicine in "My Medicines"
```

### Adherence Logging Flow
```
User → Views My Medicines → Clicks "Taken/Missed" → 
→ Backend logs in AdherenceLog collection → 
→ Automatic percentage calculation → 
→ Doctor can view stats
```

### Message Flow
```
User → Writes Message → Sends to Doctor → 
→ Backend stores in Messages collection → 
→ Doctor receives in Inbox → 
→ Doctor replies → 
→ User sees recommendation
```

## API Response Examples

### Register Response
```json
{
  "message": "User registered successfully",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Login Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@test.com",
    "role": "user"
  }
}
```

### Adherence Stats Response
```json
{
  "totalDoses": 14,
  "takenDoses": 12,
  "missedDoses": 2,
  "adherencePercentage": "85.71"
}
```

## Security Implementation

1. **Authentication**
   - JWT tokens with secret key
   - Token stored in localStorage
   - Token verification on every API call

2. **Authorization**
   - Role-based middleware checks
   - Route protection based on user role
   - Data isolation per user

3. **Password Security**
   - Bcrypt hashing with salt rounds
   - Minimum strength requirements
   - No plain text storage

4. **API Security**
   - CORS enabled for frontend
   - Body parser for input validation
   - Protected routes with middleware

## Performance Considerations

- Indexed MongoDB queries
- Pagination ready (implement in future)
- Efficient JWT validation
- Optimized React renders
- API response caching (future)

## Scalability Features

- MongoDB Atlas cloud database (auto-scaling)
- Stateless Express API
- Microservices ready architecture
- Modular route structure
- Easy to add new features

## Future Enhancement Roadmap

**Phase 2:**
- Push notifications
- Email reminders
- SMS alerts
- Mobile app (React Native)

**Phase 3:**
- AI-based adherence predictions
- Wearable device integration
- Video consultations
- Health analytics dashboard

**Phase 4:**
- Hospital EHR integration
- Insurance provider integration
- Multi-language support
- Advanced reporting

---

**This architecture ensures:**
✅ Scalability
✅ Security
✅ Maintainability
✅ User-friendly experience
✅ Real-world healthcare compatibility
