import AsyncStorage from '@react-native-async-storage/async-storage';
import { Doctor, Patient, Appointment, Prescription, FollowUp, NotificationLog, Medicine } from './types';

// Raw Initial Data Generators
const PATIENT_NAMES = [
  { first: 'Aarav', last: 'Sharma', gender: 'Male' },
  { first: 'Aditi', last: 'Verma', gender: 'Female' },
  { first: 'Amit', last: 'Patel', gender: 'Male' },
  { first: 'Ananya', last: 'Rao', gender: 'Female' },
  { first: 'Arjun', last: 'Gupta', gender: 'Male' },
  { first: 'Avani', last: 'Joshi', gender: 'Female' },
  { first: 'Bhavya', last: 'Reddy', gender: 'Male' },
  { first: 'Chaitanya', last: 'Nair', gender: 'Male' },
  { first: 'Dev', last: 'Singh', gender: 'Male' },
  { first: 'Diya', last: 'Mehta', gender: 'Female' },
  { first: 'Gaurav', last: 'Mishra', gender: 'Male' },
  { first: 'Ishaan', last: 'Kumar', gender: 'Male' },
  { first: 'Kavya', last: 'Choudhury', gender: 'Female' },
  { first: 'Manish', last: 'Sen', gender: 'Male' },
  { first: 'Meera', last: 'Iyer', gender: 'Female' },
  { first: 'Nikhil', last: 'Deshmukh', gender: 'Male' },
  { first: 'Pooja', last: 'Bose', gender: 'Female' },
  { first: 'Pranav', last: 'Shah', gender: 'Male' },
  { first: 'Rohan', last: 'Kulkarni', gender: 'Male' },
  { first: 'Riya', last: 'Das', gender: 'Female' },
  { first: 'Sanjay', last: 'Prasad', gender: 'Male' },
  { first: 'Sneha', last: 'Bhat', gender: 'Female' },
  { first: 'Siddharth', last: 'Jadhav', gender: 'Male' },
  { first: 'Tanvi', last: 'Pillai', gender: 'Female' },
  { first: 'Varun', last: 'Saxena', gender: 'Male' },
  { first: 'Zara', last: 'Khan', gender: 'Female' },
  { first: 'Rajesh', last: 'Yadav', gender: 'Male' },
  { first: 'Sunita', last: 'Rani', gender: 'Female' },
  { first: 'Vikram', last: 'Chawla', gender: 'Male' },
  { first: 'Priya', last: 'Malhotra', gender: 'Female' }
];

const SURNAME_POOL = [
  'Sharma', 'Verma', 'Patel', 'Rao', 'Gupta', 'Joshi', 'Reddy', 'Nair', 'Singh', 'Mehta',
  'Mishra', 'Kumar', 'Choudhury', 'Sen', 'Iyer', 'Deshmukh', 'Bose', 'Shah', 'Kulkarni',
  'Das', 'Prasad', 'Bhat', 'Jadhav', 'Pillai', 'Saxena', 'Khan', 'Yadav', 'Rani',
  'Chawla', 'Malhotra', 'Kapoor', 'Chatterjee', 'Dubey', 'Gowda', 'Menon', 'Gill'
];

const ALLERGIES_POOL = ['Penicillin', 'Sulfa Drugs', 'Aspirin', 'Ibuprofen', 'Peanuts', 'Dust Mites', 'Pollen', 'Shellfish', 'Dairy'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SYMPTOMS_POOL = [
  'Dry cough, low-grade fever, sore throat',
  'High fever, severe headache, muscle pain, nausea',
  'Chronic fatigue, frequent urination, excessive thirst',
  'Shortness of breath, chest tightness, wheezing',
  'Severe chest burn, acid reflux, throat discomfort',
  'Joint pain, morning stiffness, swelling in knees',
  'Throbbing headache, sensitivity to light and sound',
  'Sneezing, running nose, itchy eyes, mild congestion',
  'Abdominal bloating, loose stools, mild cramping',
  'High blood pressure reading, mild dizziness, anxiety'
];

const DIAGNOSES_POOL = [
  { disease: 'Acute Viral Upper Respiratory Infection', tests: ['Complete Blood Count (CBC)', 'Throat Swab Culture'] },
  { disease: 'Suspected Dengue Fever', tests: ['Dengue NS1 Antigen Test', 'Platelet Count Monitoring'] },
  { disease: 'Type 2 Diabetes Mellitus', tests: ['HbA1c (Glycated Hemoglobin)', 'Fasting Blood Sugar (FBS)'] },
  { disease: 'Mild Persistent Bronchial Asthma', tests: ['Spirometry (Lung Function Test)', 'Chest X-Ray'] },
  { disease: 'Gastroesophageal Reflux Disease (GERD)', tests: ['Upper GI Endoscopy'] },
  { disease: 'Osteoarthritis of Knees', tests: ['X-ray Bilateral Knees (Weight Bearing)', 'Rheumatoid Factor (RA) Test'] },
  { disease: 'Classic Migraine', tests: ['Neurological Evaluation'] },
  { disease: 'Allergic Rhinitis', tests: ['Serum IgE Level Check'] },
  { disease: 'Irritable Bowel Syndrome (IBS)', tests: ['Stool Routine & Culture'] },
  { disease: 'Essential Hypertension', tests: ['Electrocardiogram (ECG)', 'Serum Creatinine', 'Lipid Profile'] }
];

const MEDICINES_POOL = [
  { name: 'Paracetamol 650mg', dosage: '1 tablet', duration: '5 days', morning: true, afternoon: true, night: true },
  { name: 'Amoxicillin 500mg', dosage: '1 capsule', duration: '7 days', morning: true, afternoon: false, night: true },
  { name: 'Pantoprazole 40mg', dosage: '1 tablet (Empty stomach)', duration: '14 days', morning: true, afternoon: false, night: false },
  { name: 'Metformin 500mg', dosage: '1 tablet (Post meals)', duration: '30 days', morning: true, afternoon: false, night: true },
  { name: 'Cetirizine 10mg', dosage: '1 tablet', duration: '10 days', morning: false, afternoon: false, night: true },
  { name: 'Ibuprofen 400mg', dosage: '1 tablet (As needed)', duration: '5 days', morning: true, afternoon: false, night: true },
  { name: 'Montelukast 10mg', dosage: '1 tablet', duration: '15 days', morning: false, afternoon: false, night: true },
  { name: 'Atorvastatin 10mg', dosage: '1 tablet', duration: '30 days', morning: false, afternoon: false, night: true },
  { name: 'Amlodipine 5mg', dosage: '1 tablet', duration: '30 days', morning: true, afternoon: false, night: false },
  { name: 'Multivitamin Supplements', dosage: '1 capsule', duration: '30 days', morning: true, afternoon: false, night: false }
];

const DEFAULT_DOCTOR: Doctor = {
  id: 'doc-1',
  name: 'Dr. Vikram Aditya Sharma',
  qualification: 'MBBS, MD (General Medicine)',
  specialization: 'Internal Medicine Specialist',
  registrationNumber: 'MCI-87349-2015',
  mobile: '+91 98765 43210',
  email: 'dr.vikram.sharma@healthclinic.com',
  clinicName: 'Aura Healing Multispecialty Clinic',
  clinicAddress: 'Suite 402, Royal Plaza, Sector 15, HSR Layout, Bengaluru, Karnataka - 560102',
  clinicPhone: '080-45672901',
  clinicLogo: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&h=150&fit=crop&q=80'
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

export const generatePatients = (): Patient[] => {
  const patients: Patient[] = [];
  const now = new Date();

  for (let i = 1; i <= 50; i++) {
    const isPoolName = i <= PATIENT_NAMES.length;
    let firstName = '';
    let lastName = '';
    let gender: 'Male' | 'Female' | 'Other' = 'Male';

    if (isPoolName) {
      const p = PATIENT_NAMES[i - 1];
      firstName = p.first;
      lastName = p.last;
      gender = p.gender as 'Male' | 'Female' | 'Other';
    } else {
      gender = randomInt(1, 10) > 5 ? 'Male' : 'Female';
      firstName = gender === 'Male' 
        ? randomChoice(['Rahul', 'Suresh', 'Karan', 'Vijay', 'Deepak', 'Aakash', 'Raman', 'Arvind', 'Vivek', 'Harish'])
        : randomChoice(['Neelam', 'Kiran', 'Shweta', 'Priti', 'Radhika', 'Neha', 'Kriti', 'Megha', 'Priyanka', 'Anjali']);
      lastName = randomChoice(SURNAME_POOL);
    }

    const age = randomInt(5, 82);
    const birthYear = now.getFullYear() - age;
    const dob = `${birthYear}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`;
    const bloodGroup = randomChoice(BLOOD_GROUPS);
    const height = age < 15 ? randomInt(100, 150) : randomInt(150, 188);
    const weight = age < 15 ? randomInt(20, 50) : randomInt(50, 95);
    const mobile = `+91 ${randomInt(70000, 99999)} ${randomInt(10000, 99999)}`;
    const address = `${randomInt(10, 500)}, Cross Road, Phase ${randomInt(1, 5)}, Sector ${randomInt(1, 12)}, Bengaluru`;
    
    const allergies: string[] = [];
    if (randomInt(1, 100) <= 30) {
      allergies.push(randomChoice(ALLERGIES_POOL));
      if (randomInt(1, 100) <= 15) {
        const second = randomChoice(ALLERGIES_POOL);
        if (!allergies.includes(second)) allergies.push(second);
      }
    }

    const notes = randomChoice([
      'Regular follow-up patient for diabetic monitoring.',
      'Slightly hypertensive. Advised low salt diet.',
      'No major prior surgical history. Active runner.',
      'Sedentary lifestyle, complaints of lower back pain.',
      'Allergies to standard penicillins, use alternatives.',
      'Thyroid patient under medication.',
      'Healthy general profile.',
      'Complains of frequent seasonal asthma attacks.'
    ]);

    patients.push({
      id: `pat-${i}`,
      fullName: `${firstName} ${lastName}`,
      mobile,
      gender,
      age,
      dob,
      bloodGroup,
      height,
      weight,
      address,
      allergies,
      notes,
      createdAt: new Date(now.getTime() - randomInt(10, 180) * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return patients;
};

export const generateAppointments = (patients: Patient[]): Appointment[] => {
  const appointments: Appointment[] = [];
  const now = new Date();
  const timeSlots = ['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
  const reasons = [
    'General Health Checkup',
    'Follow up Consultation',
    'Chronic Throat Pain',
    'High Blood Sugar Level Check',
    'Fever and Muscle Ache',
    'Migraine management review',
    'Acid Reflux worsening',
    'Knee pain assessment',
    'Skin rashes and itching',
    'Prescription Renewal'
  ];

  const todayStr = now.toISOString().split('T')[0];
  const getRelativeDate = (offsetDays: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  let appointmentIdCounter = 1;

  // 1. Today's appointments (10 total)
  for (let i = 0; i < 10; i++) {
    const patient = patients[randomInt(0, patients.length - 1)];
    const time = timeSlots[i % timeSlots.length];
    let status: Appointment['status'] = 'Confirmed';
    if (i < 4) status = 'Completed';
    else if (i < 7) status = 'Confirmed';
    else if (i < 9) status = 'Booked';
    else status = 'Cancelled';

    appointments.push({
      id: `apt-${appointmentIdCounter++}`,
      patientId: patient.id,
      patientName: patient.fullName,
      date: todayStr,
      time,
      status,
      reasonForVisit: randomChoice(reasons),
      notes: status === 'Completed' ? 'Patient reported feeling better than last visit.' : 'Standard appointment.'
    });
  }

  // 2. Upcoming (15 total)
  for (let i = 0; i < 15; i++) {
    const patient = patients[randomInt(0, patients.length - 1)];
    const dayOffset = randomInt(1, 7);
    const date = getRelativeDate(dayOffset);
    const time = randomChoice(timeSlots);
    const status: Appointment['status'] = randomInt(1, 100) > 85 ? 'Booked' : 'Confirmed';

    appointments.push({
      id: `apt-${appointmentIdCounter++}`,
      patientId: patient.id,
      patientName: patient.fullName,
      date,
      time,
      status,
      reasonForVisit: randomChoice(reasons),
      notes: 'Upcoming checkup.'
    });
  }

  // 3. Past (75 total)
  for (let i = 0; i < 75; i++) {
    const patient = patients[randomInt(0, patients.length - 1)];
    const dayOffset = -randomInt(1, 30);
    const date = getRelativeDate(dayOffset);
    const time = randomChoice(timeSlots);
    const roll = randomInt(1, 100);
    const status: Appointment['status'] = roll <= 80 ? 'Completed' : roll <= 90 ? 'No Show' : 'Cancelled';

    appointments.push({
      id: `apt-${appointmentIdCounter++}`,
      patientId: patient.id,
      patientName: patient.fullName,
      date,
      time,
      status,
      reasonForVisit: randomChoice(reasons),
      notes: status === 'Completed' ? 'Successfully completed consultation.' : 'Did not turn up.'
    });
  }

  return appointments.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
};

export const generatePrescriptions = (appointments: Appointment[], patients: Patient[]): Prescription[] => {
  const prescriptions: Prescription[] = [];
  const completedApts = appointments.filter(a => a.status === 'Completed');
  let prescriptionIdCounter = 1;
  
  completedApts.forEach(apt => {
    const patient = patients.find(p => p.id === apt.patientId) || patients[0];
    const dx = randomChoice(DIAGNOSES_POOL);
    const medicines: Medicine[] = [];
    const numMeds = randomInt(1, 3);
    const poolCopy = [...MEDICINES_POOL];
    for (let m = 0; m < numMeds; m++) {
      const idx = randomInt(0, poolCopy.length - 1);
      const chosen = poolCopy.splice(idx, 1)[0];
      medicines.push({ ...chosen });
    }

    prescriptions.push({
      id: `rx-${prescriptionIdCounter++}`,
      appointmentId: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName,
      date: apt.date,
      symptoms: randomChoice(SYMPTOMS_POOL),
      diagnosis: dx.disease,
      medicines,
      testsRecommended: dx.tests,
      notes: 'Take medicines after meals. Hydrate well and rest.',
      status: 'Finalized'
    });
  });

  const remainingCount = 100 - prescriptions.length;
  for (let i = 0; i < remainingCount; i++) {
    const patient = patients[randomInt(0, patients.length - 1)];
    const dateOffset = -randomInt(31, 180);
    const d = new Date();
    d.setDate(d.getDate() + dateOffset);
    const dateStr = d.toISOString().split('T')[0];

    const dx = randomChoice(DIAGNOSES_POOL);
    const medicines: Medicine[] = [];
    const numMeds = randomInt(1, 2);
    const poolCopy = [...MEDICINES_POOL];
    for (let m = 0; m < numMeds; m++) {
      const idx = randomInt(0, poolCopy.length - 1);
      const chosen = poolCopy.splice(idx, 1)[0];
      medicines.push({ ...chosen });
    }

    prescriptions.push({
      id: `rx-${prescriptionIdCounter++}`,
      appointmentId: `apt-hist-${i}`,
      patientId: patient.id,
      patientName: patient.fullName,
      date: dateStr,
      symptoms: randomChoice(SYMPTOMS_POOL),
      diagnosis: dx.disease,
      medicines,
      testsRecommended: dx.tests,
      notes: 'Follow-up in case of persistent pain/fever.',
      status: 'Finalized'
    });
  }

  return prescriptions.sort((a, b) => b.date.localeCompare(a.date));
};

export const generateFollowUps = (patients: Patient[]): FollowUp[] => {
  const followUps: FollowUp[] = [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const getRelativeDate = (offsetDays: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  let followUpIdCounter = 1;

  for (let i = 0; i < 10; i++) {
    const patient = patients[randomInt(0, patients.length - 1)];
    const status: FollowUp['status'] = i < 6 ? 'Pending' : 'Completed';
    followUps.push({
      id: `flw-${followUpIdCounter++}`,
      patientId: patient.id,
      patientName: patient.fullName,
      dueDate: todayStr,
      notes: 'Review clinical symptoms, check blood pressure levels.',
      status
    });
  }

  for (let i = 0; i < 20; i++) {
    const patient = patients[randomInt(0, patients.length - 1)];
    const dayOffset = randomInt(1, 30);
    const dueDate = getRelativeDate(dayOffset);
    followUps.push({
      id: `flw-${followUpIdCounter++}`,
      patientId: patient.id,
      patientName: patient.fullName,
      dueDate,
      notes: 'General status review after completion of medications.',
      status: 'Pending'
    });
  }

  for (let i = 0; i < 20; i++) {
    const patient = patients[randomInt(0, patients.length - 1)];
    const dayOffset = -randomInt(1, 20);
    const dueDate = getRelativeDate(dayOffset);
    const status: FollowUp['status'] = i < 15 ? 'Missed' : 'Completed';
    followUps.push({
      id: `flw-${followUpIdCounter++}`,
      patientId: patient.id,
      patientName: patient.fullName,
      dueDate,
      notes: 'Routine blood sugar follow up check.',
      status
    });
  }

  return followUps.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
};

export const generateNotifications = (patients: Patient[]): NotificationLog[] => {
  const logs: NotificationLog[] = [];
  const now = new Date();
  
  const getRelativeDateTimeString = (offsetDays: number, hour: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  const messageTemplates = [
    'Dear {name}, this is a reminder for your upcoming appointment today at {time}. Please arrive 10 mins early. Aura Clinic.',
    'Dear {name}, your follow up consultation is scheduled for tomorrow. Kindly confirm if you will visit. Aura Clinic.',
    'Reminder: Dear {name}, please remember to take your afternoon medications (post meals). Aura Clinic.'
  ];

  let idCount = 1;

  for (let i = 0; i < 20; i++) {
    const patient = patients[randomInt(0, patients.length - 1)];
    const status: NotificationLog['status'] = i < 15 ? 'Sent' : 'Failed';
    const type = i % 3 === 0 ? 'Appointment' : i % 3 === 1 ? 'FollowUp' : 'Medicine';
    
    let message = randomChoice(messageTemplates)
      .replace('{name}', patient.fullName)
      .replace('{time}', '10:30 AM');

    logs.push({
      id: `notif-${idCount++}`,
      type,
      recipientName: patient.fullName,
      recipientMobile: patient.mobile,
      message,
      scheduledTime: getRelativeDateTimeString(-randomInt(1, 5), randomInt(9, 17)),
      sentTime: status === 'Sent' ? getRelativeDateTimeString(-randomInt(1, 5), randomInt(9, 17)) : undefined,
      status
    });
  }

  for (let i = 0; i < 10; i++) {
    const patient = patients[randomInt(0, patients.length - 1)];
    const type = i % 3 === 0 ? 'Appointment' : i % 3 === 1 ? 'FollowUp' : 'Medicine';
    
    let message = randomChoice(messageTemplates)
      .replace('{name}', patient.fullName)
      .replace('{time}', '02:30 PM');

    logs.push({
      id: `notif-${idCount++}`,
      type,
      recipientName: patient.fullName,
      recipientMobile: patient.mobile,
      message,
      scheduledTime: getRelativeDateTimeString(randomInt(1, 3), randomInt(9, 17)),
      status: 'Scheduled'
    });
  }

  return logs;
};

const STORAGE_KEY = 'clinic_management_db';

export interface ClinicDBData {
  doctor: Doctor;
  patients: Patient[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  followUps: FollowUp[];
  notifications: NotificationLog[];
}

export const seedDatabase = (): ClinicDBData => {
  const patients = generatePatients();
  const appointments = generateAppointments(patients);
  const prescriptions = generatePrescriptions(appointments, patients);
  const followUps = generateFollowUps(patients);
  const notifications = generateNotifications(patients);

  return {
    doctor: DEFAULT_DOCTOR,
    patients,
    appointments,
    prescriptions,
    followUps,
    notifications
  };
};

export const loadLocalDb = async (): Promise<ClinicDBData> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.patients && parsed.patients.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading AsyncStorage clinic DB', e);
  }

  // Seed and save if empty
  const seeded = seedDatabase();
  await saveLocalDb(seeded);
  return seeded;
};

export const saveLocalDb = async (data: ClinicDBData): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to AsyncStorage clinic DB', e);
  }
};
