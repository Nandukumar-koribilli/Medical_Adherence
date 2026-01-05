# 📖 Comprehensive API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Header
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🔐 Authentication Endpoints

### Register User
```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "name": "John Doe",
  "email": "john@test.com",
  "password": "password123",
  "role": "user",
  "phone": "1234567890"
}

Response (201):
{
  "message": "User registered successfully",
  "userId": "507f1f77bcf86cd799439011"
}
```

### Login User
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "john@test.com",
  "password": "password123"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@test.com",
    "role": "user"
  }
}
```

---

## 👥 User Endpoints

### Get All Users
```
GET /users
Response: Array of user objects

[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@test.com",
    "role": "user",
    "phone": "1234567890",
    "age": 30,
    "address": "123 Main St"
  },
  ...
]
```

### Get User Profile
```
GET /users/profile/:id
Authorization: Required

Response (200):
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@test.com",
  "role": "user",
  "phone": "1234567890",
  "age": 30,
  "address": "123 Main St",
  "profilePicture": "url",
  "createdAt": "2024-01-05T10:30:00Z"
}
```

### Update User Profile
```
PUT /users/profile/:id
Authorization: Required
Content-Type: application/json

Request Body:
{
  "name": "Jane Doe",
  "phone": "9876543210",
  "age": 31,
  "address": "456 Oak Ave"
}

Response (200):
{
  "message": "Profile updated successfully",
  "user": { ...updated user object }
}
```

### Get All Doctors
```
GET /users/doctors

Response: Array of doctor objects
```

---

## 💊 Medicine Endpoints

### Get Medicine Store
```
GET /medicines/store

Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Aspirin",
    "dosage": "500mg",
    "frequency": "Twice daily",
    "price": 100,
    "description": "Pain reliever",
    "manufacturer": "Pharma Inc",
    "category": "Pain Relief",
    "inStock": true,
    "uploadedBy": {
      "_id": "admin_id",
      "name": "Admin User"
    }
  },
  ...
]
```

### Add Medicine to User
```
POST /medicines/add-to-user
Authorization: Required
Content-Type: application/json

Request Body:
{
  "medicineId": "507f1f77bcf86cd799439012",
  "dosage": "1 tablet",
  "frequency": "Twice daily",
  "startDate": "2024-01-05T00:00:00Z",
  "endDate": "2024-02-05T00:00:00Z",
  "timeSlots": ["08:00", "20:00"]
}

Response (201):
{
  "message": "Medicine added successfully",
  "data": { ...user medicine object }
}
```

### Get User's Medicines
```
GET /medicines/my-medicines
Authorization: Required

Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "medicineId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Aspirin",
      "dosage": "500mg",
      ...
    },
    "dosage": "1 tablet",
    "frequency": "Twice daily",
    "timeSlots": ["08:00", "20:00"]
  },
  ...
]
```

### Upload Medicine (Admin Only)
```
POST /medicines/upload
Authorization: Required (Admin role)
Content-Type: application/json

Request Body:
{
  "name": "Aspirin",
  "dosage": "500mg",
  "frequency": "Twice daily",
  "description": "Effective pain reliever",
  "price": 100,
  "manufacturer": "Pharma Inc",
  "category": "Pain Relief"
}

Response (201):
{
  "message": "Medicine uploaded successfully",
  "medicine": { ...medicine object }
}
```

### Delete Medicine (Admin Only)
```
DELETE /medicines/:id
Authorization: Required (Admin role)

Response (200):
{
  "message": "Medicine deleted successfully"
}
```

---

## 📊 Adherence Endpoints

### Log Adherence
```
POST /adherence/log
Authorization: Required
Content-Type: application/json

Request Body:
{
  "medicineId": "507f1f77bcf86cd799439012",
  "date": "2024-01-05T00:00:00Z",
  "time": "08:30",
  "status": "taken",
  "dosage": "1 tablet",
  "notes": "Taken with water"
}

Response (201):
{
  "message": "Adherence logged successfully",
  "log": { ...adherence log object }
}
```

### Get User's Adherence Logs
```
GET /adherence/user-logs
Authorization: Required

Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "medicineId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Aspirin",
      ...
    },
    "date": "2024-01-05T00:00:00Z",
    "time": "08:30",
    "status": "taken",
    "dosage": "1 tablet",
    "notes": "Taken with water",
    "createdAt": "2024-01-05T08:30:00Z"
  },
  ...
]
```

### Get Adherence Statistics
```
GET /adherence/stats/:userId
Authorization: Required

Response (200):
{
  "totalDoses": 14,
  "takenDoses": 12,
  "missedDoses": 2,
  "adherencePercentage": "85.71"
}
```

---

## 💬 Message Endpoints

### Send Message
```
POST /messages/send
Authorization: Required
Content-Type: application/json

Request Body:
{
  "receiverId": "507f1f77bcf86cd799439011",
  "subject": "Health Consultation",
  "message": "I have been experiencing headaches...",
  "messageType": "text"
}

Response (201):
{
  "message": "Message sent successfully",
  "data": { ...message object }
}
```

### Get Received Messages
```
GET /messages/received
Authorization: Required

Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "senderId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@test.com"
    },
    "receiverId": "507f1f77bcf86cd799439010",
    "subject": "Health Consultation",
    "message": "I have been experiencing headaches...",
    "isRead": false,
    "messageType": "text",
    "createdAt": "2024-01-05T10:30:00Z"
  },
  ...
]
```

### Get Sent Messages
```
GET /messages/sent
Authorization: Required

Response (200):
[
  { ...message objects sent by user }
]
```

### Mark Message as Read
```
PUT /messages/:id/read
Authorization: Required

Response (200):
{
  "message": "Message marked as read",
  "data": { ...updated message object }
}
```

---

## ⚙️ Admin Endpoints

### Assign Patient to Doctor
```
POST /admin/assign-patient
Authorization: Required (Admin role)
Content-Type: application/json

Request Body:
{
  "doctorId": "507f1f77bcf86cd799439016",
  "patientId": "507f1f77bcf86cd799439011"
}

Response (201):
{
  "message": "Patient assigned successfully",
  "data": { ...assignment object }
}
```

### Get All Medicines
```
GET /admin/medicines
Authorization: Required (Admin role)

Response (200):
[
  { ...all medicine objects }
]
```

### Update Medicine Stock
```
PUT /admin/medicines/:id
Authorization: Required (Admin role)
Content-Type: application/json

Request Body:
{
  "inStock": true
}

Response (200):
{
  "message": "Medicine updated successfully",
  "medicine": { ...updated medicine object }
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "message": "Email already registered"
}
```

### 401 - Unauthorized
```json
{
  "message": "No token provided"
}
```

### 403 - Forbidden
```json
{
  "message": "Access denied"
}
```

### 404 - Not Found
```json
{
  "message": "User not found"
}
```

### 500 - Server Error
```json
{
  "message": "Error message",
  "error": "Detailed error"
}
```

---

## Status Codes Summary

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST request |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal error |

---

## Testing with cURL Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123","role":"user"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
```

### Get Profile
```bash
curl -X GET http://localhost:5000/api/users/profile/{userId} \
  -H "Authorization: Bearer {token}"
```

---

**For more information, see the main README.md and QUICK_START.md files.**
