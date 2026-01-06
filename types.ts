
export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  token?: string; // Add token for local storage
  phone?: string;
  patientId?: string; // Links patient to doctor
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  price?: number;
  stock?: number;
  description?: string;
}

export interface AdherenceLog {
  id: string;
  patientId: string;
  medicationId: string;
  status: 'taken' | 'skipped' | 'missed';
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface AIInsight {
  patientId: string;
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  recommendations: string[];
}
