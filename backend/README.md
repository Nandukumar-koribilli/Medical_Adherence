# Backend Documentation

## Directory Structure

```
backend/
├── models/              # Database schemas
│   ├── User.js
│   ├── Medicine.js
│   ├── UserMedicine.js
│   ├── AdherenceLog.js
│   ├── Message.js
│   └── DoctorPatient.js
├── routes/             # API routes
│   ├── auth.js
│   ├── users.js
│   ├── medicines.js
│   ├── adherence.js
│   ├── messages.js
│   └── admin.js
├── middleware/         # Custom middleware
│   └── auth.js
├── .env               # Environment variables
├── server.js          # Main server file
└── package.json       # Dependencies
```

## Models

### User Schema
- name, email, password
- role (user/doctor/admin)
- phone, age, address
- profilePicture

### Medicine Schema
- name, dosage, frequency
- description, price
- manufacturer, category
- uploadedBy (Admin), inStock

### UserMedicine Schema
- userId, medicineId
- dosage, frequency
- startDate, endDate
- timeSlots

### AdherenceLog Schema
- userId, medicineId
- date, time
- status (taken/missed/snoozed)
- notes

### Message Schema
- senderId, receiverId
- subject, message
- isRead, messageType
- attachments

### DoctorPatient Schema
- doctorId, patientId
- assignedDate
- notes, status, riskLevel

## Authentication

Uses JWT for secure authentication. Token expires in 7 days.

## Getting Started

```bash
cd backend
npm install
npm start
```
