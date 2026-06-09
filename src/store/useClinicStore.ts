import { create } from 'zustand';
import { Patient, Appointment, Prescription, FollowUp, NotificationLog } from '../services/types';
import { loadLocalDb, saveLocalDb, ClinicDBData } from '../services/mockDb';

interface ClinicState {
  patients: Patient[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  followUps: FollowUp[];
  notifications: NotificationLog[];
  isLoading: boolean;

  // Initializer
  initializeDb: () => Promise<void>;

  // Internal Sync
  _sync: (updater: Partial<ClinicDBData>) => Promise<void>;

  // Patient Actions
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Promise<Patient>;
  updatePatient: (id: string, updatedFields: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;

  // Appointment Actions
  createAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<Appointment>;
  updateAppointment: (id: string, updatedFields: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  markAppointmentComplete: (id: string) => Promise<void>;

  // Prescription Actions
  createPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<Prescription>;
  updatePrescriptionDraft: (id: string, updatedFields: Partial<Prescription>) => Promise<void>;

  // Follow-Up Actions
  createFollowUp: (followUp: Omit<FollowUp, 'id'>) => Promise<FollowUp>;
  markFollowUpComplete: (id: string) => Promise<void>;

  // Simulation Actions
  sendScheduledNotifications: () => Promise<void>;
  addNotificationLog: (log: Omit<NotificationLog, 'id'>) => Promise<void>;
}

export const useClinicStore = create<ClinicState>((set, get) => ({
  patients: [],
  appointments: [],
  prescriptions: [],
  followUps: [],
  notifications: [],
  isLoading: true,

  initializeDb: async () => {
    const db = await loadLocalDb();
    set({
      patients: db.patients,
      appointments: db.appointments,
      prescriptions: db.prescriptions,
      followUps: db.followUps,
      notifications: db.notifications,
      isLoading: false,
    });
  },

  _sync: async (updater) => {
    const db = await loadLocalDb();
    const merged = { ...db, ...updater };
    await saveLocalDb(merged);
    set(updater as any);
  },

  // Patients
  addPatient: async (fields) => {
    const patients = [...get().patients];
    const newId = `pat-${patients.length + 1}-${Math.floor(Math.random() * 1000)}`;
    const newPatient: Patient = {
      ...fields,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    patients.push(newPatient);
    await get()._sync({ patients });
    return newPatient;
  },

  updatePatient: async (id, fields) => {
    const patients = get().patients.map((p) => (p.id === id ? { ...p, ...fields } : p));
    const appointments = get().appointments.map((a) => (a.patientId === id && fields.fullName ? { ...a, patientName: fields.fullName } : a));
    const prescriptions = get().prescriptions.map((pr) => (pr.patientId === id && fields.fullName ? { ...pr, patientName: fields.fullName } : pr));
    const followUps = get().followUps.map((f) => (f.patientId === id && fields.fullName ? { ...f, patientName: fields.fullName } : f));
    await get()._sync({ patients, appointments, prescriptions, followUps });
  },

  deletePatient: async (id) => {
    const patients = get().patients.filter((p) => p.id !== id);
    const appointments = get().appointments.filter((a) => a.patientId !== id);
    const prescriptions = get().prescriptions.filter((pr) => pr.patientId !== id);
    const followUps = get().followUps.filter((f) => f.patientId !== id);
    await get()._sync({ patients, appointments, prescriptions, followUps });
  },

  // Appointments
  createAppointment: async (fields) => {
    const appointments = [...get().appointments];
    const newId = `apt-${appointments.length + 1}-${Math.floor(Math.random() * 1000)}`;
    const newApt: Appointment = {
      ...fields,
      id: newId,
    };
    appointments.push(newApt);

    // Notification Log
    const notifications = [...get().notifications];
    const notifMsg = `Dear ${fields.patientName}, your appointment has been booked for ${fields.date} at ${fields.time}. Aura Clinic.`;
    notifications.unshift({
      id: `notif-${notifications.length + 1}-${Math.floor(Math.random() * 1000)}`,
      type: 'Appointment',
      recipientName: fields.patientName,
      recipientMobile: '+91 99999 88888',
      message: notifMsg,
      scheduledTime: new Date().toISOString(),
      status: 'Scheduled',
    });

    await get()._sync({ appointments, notifications });
    return newApt;
  },

  updateAppointment: async (id, fields) => {
    const appointments = get().appointments.map((a) => (a.id === id ? { ...a, ...fields } : a));
    await get()._sync({ appointments });
  },

  cancelAppointment: async (id) => {
    const appointments = get().appointments.map((a) => (a.id === id ? { ...a, status: 'Cancelled' as const } : a));
    await get()._sync({ appointments });
  },

  markAppointmentComplete: async (id) => {
    const appointments = get().appointments.map((a) => (a.id === id ? { ...a, status: 'Completed' as const } : a));
    await get()._sync({ appointments });
  },

  // Prescriptions
  createPrescription: async (fields) => {
    const prescriptions = [...get().prescriptions];
    const newId = `rx-${prescriptions.length + 1}-${Math.floor(Math.random() * 1000)}`;
    const newRx: Prescription = {
      ...fields,
      id: newId,
    };
    prescriptions.unshift(newRx);

    // Mark appointment as Completed
    let appointments = get().appointments;
    if (fields.appointmentId) {
      appointments = appointments.map((a) => (a.id === fields.appointmentId ? { ...a, status: 'Completed' as const } : a));
    }

    await get()._sync({ prescriptions, appointments });
    return newRx;
  },

  updatePrescriptionDraft: async (id, fields) => {
    const prescriptions = get().prescriptions.map((pr) => (pr.id === id ? { ...pr, ...fields } : pr));
    await get()._sync({ prescriptions });
  },

  // Follow-ups
  createFollowUp: async (fields) => {
    const followUps = [...get().followUps];
    const newId = `flw-${followUps.length + 1}-${Math.floor(Math.random() * 1000)}`;
    const newFollowUp: FollowUp = {
      ...fields,
      id: newId,
    };
    followUps.push(newFollowUp);

    // Notification Log
    const notifications = [...get().notifications];
    const notifMsg = `Dear ${fields.patientName}, this is a reminder for your upcoming clinical follow-up due on ${fields.dueDate}. Aura Clinic.`;
    notifications.unshift({
      id: `notif-${notifications.length + 1}-${Math.floor(Math.random() * 1000)}`,
      type: 'FollowUp',
      recipientName: fields.patientName,
      recipientMobile: '+91 99999 88888',
      message: notifMsg,
      scheduledTime: new Date().toISOString(),
      status: 'Scheduled',
    });

    await get()._sync({ followUps, notifications });
    return newFollowUp;
  },

  markFollowUpComplete: async (id) => {
    const followUps = get().followUps.map((f) => (f.id === id ? { ...f, status: 'Completed' as const } : f));
    await get()._sync({ followUps });
  },

  // Simulation
  sendScheduledNotifications: async () => {
    const notifications = get().notifications.map((n) => {
      if (n.status === 'Scheduled') {
        const isSent = Math.random() > 0.15;
        return {
          ...n,
          status: (isSent ? 'Sent' : 'Failed') as 'Sent' | 'Failed',
          sentTime: isSent ? new Date().toISOString() : undefined,
        };
      }
      return n;
    });
    await get()._sync({ notifications });
  },

  addNotificationLog: async (fields) => {
    const notifications = [...get().notifications];
    const newId = `notif-${notifications.length + 1}-${Math.floor(Math.random() * 1000)}`;
    notifications.unshift({
      ...fields,
      id: newId,
    });
    await get()._sync({ notifications });
  },
}));
