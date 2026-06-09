export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  registrationNumber: string;
  mobile: string;
  email: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicLogo?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  mobile: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  dob: string;
  bloodGroup: string;
  height: number; // in cm
  weight: number; // in kg
  address: string;
  allergies: string[];
  notes: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'Booked' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';
  reasonForVisit: string;
  notes?: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  medicines: Medicine[];
  testsRecommended: string[];
  notes?: string;
  status: 'Draft' | 'Finalized';
}

export interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  dueDate: string; // YYYY-MM-DD
  notes?: string;
  status: 'Pending' | 'Completed' | 'Missed';
}

export interface NotificationLog {
  id: string;
  type: 'Appointment' | 'FollowUp' | 'Medicine';
  recipientName: string;
  recipientMobile: string;
  message: string;
  scheduledTime: string;
  sentTime?: string;
  status: 'Scheduled' | 'Sent' | 'Failed';
}
