import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, TextInput, Surface, List, SegmentedButtons } from 'react-native-paper';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useClinicStore } from '../../src/store/useClinicStore';

export default function MobileSettings() {
  const { doctor, updateProfile } = useAuthStore();
  const { notifications, sendScheduledNotifications } = useClinicStore();

  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [docName, setDocName] = useState(doctor?.name || '');
  const [docQual, setDocQual] = useState(doctor?.qualification || '');
  const [docSpec, setDocSpec] = useState(doctor?.specialization || '');
  const [docReg, setDocReg] = useState(doctor?.registrationNumber || '');
  const [docPhone, setDocPhone] = useState(doctor?.mobile || '');
  const [docEmail, setDocEmail] = useState(doctor?.email || '');

  const [clinicName, setClinicName] = useState(doctor?.clinicName || '');
  const [clinicAddress, setClinicAddress] = useState(doctor?.clinicAddress || '');
  const [clinicPhone, setClinicPhone] = useState(doctor?.clinicPhone || '');
  const [clinicLogo, setClinicLogo] = useState(doctor?.clinicLogo || '');

  const handleSaveProfile = async () => {
    await updateProfile({
      name: docName,
      qualification: docQual,
      specialization: docSpec,
      registrationNumber: docReg,
      mobile: docPhone,
      email: docEmail,
    });
    alert('Doctor profile updated locally.');
  };

  const handleSaveClinic = async () => {
    await updateProfile({
      clinicName,
      clinicAddress,
      clinicPhone,
      clinicLogo,
    });
    alert('Clinic configurations updated locally.');
  };

  const handleRunSimulation = async () => {
    await sendScheduledNotifications();
    alert('SMS logs updated! Simulated scheduled items processed.');
  };

  // Notification counters
  const scheduledCount = notifications.filter(n => n.status === 'Scheduled').length;
  const sentCount = notifications.filter(n => n.status === 'Sent').length;
  const failedCount = notifications.filter(n => n.status === 'Failed').length;

  return (
    <View style={styles.container}>
      
      {/* Top Toggle buttons */}
      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        style={styles.segmentBar}
        buttons={[
          { value: 'profile', label: 'Doctor Info', checkedColor: '#0ea5e9' },
          { value: 'clinic', label: 'Clinic Settings' },
          { value: 'simulator', label: 'SMS Sim' },
        ]}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        
        {/* A. DOCTOR PROFILE TAB */}
        {activeTab === 'profile' && (
          <Surface style={styles.card} elevation={0}>
            <Text style={styles.cardTitle}>Doctor Credentials</Text>
            
            <TextInput
              label="Doctor Full Name"
              value={docName}
              onChangeText={setDocName}
              mode="outlined"
              style={styles.input}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Qualification (e.g. MBBS, MD)"
              value={docQual}
              onChangeText={setDocQual}
              mode="outlined"
              style={styles.input}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Specialization (e.g. Pediatrics)"
              value={docSpec}
              onChangeText={setDocSpec}
              mode="outlined"
              style={styles.input}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Medical Registration Number"
              value={docReg}
              onChangeText={setDocReg}
              mode="outlined"
              style={styles.input}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Mobile Number"
              value={docPhone}
              onChangeText={setDocPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Doctor Email"
              value={docEmail}
              onChangeText={setDocEmail}
              mode="outlined"
              keyboardType="email-address"
              style={styles.input}
              activeOutlineColor="#0ea5e9"
            />

            <Button
              mode="contained"
              onPress={handleSaveProfile}
              style={styles.saveBtn}
              buttonColor="#0ea5e9"
            >
              Save Credentials
            </Button>
          </Surface>
        )}

        {/* B. CLINIC SETTINGS TAB */}
        {activeTab === 'clinic' && (
          <Surface style={styles.card} elevation={0}>
            <Text style={styles.cardTitle}>Clinic Information</Text>

            <TextInput
              label="Clinic Facility Name"
              value={clinicName}
              onChangeText={setClinicName}
              mode="outlined"
              style={styles.input}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Clinic Telephone Number"
              value={clinicPhone}
              onChangeText={setClinicPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Clinic Logo Link (Direct URL)"
              value={clinicLogo}
              onChangeText={setClinicLogo}
              mode="outlined"
              style={styles.input}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Clinic Address (for prescriptions)"
              value={clinicAddress}
              onChangeText={setClinicAddress}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
              activeOutlineColor="#0ea5e9"
            />

            <Button
              mode="contained"
              onPress={handleSaveClinic}
              style={styles.saveBtn}
              buttonColor="#0ea5e9"
            >
              Save Clinic Settings
            </Button>
          </Surface>
        )}

        {/* C. REMINDER SIMULATION TAB */}
        {activeTab === 'simulator' && (
          <View style={styles.simContainer}>
            {/* Simulation controllers */}
            <Card style={styles.simCard}>
              <Card.Content>
                <Text style={styles.simCardTitle}>Simulation Engine</Text>
                <Text style={styles.simCardText}>
                  Aura Clinic simulates sending patient SMS alerts for upcoming appointments, follow ups, and medication schedules.
                </Text>

                <View style={styles.statGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNum}>{scheduledCount}</Text>
                    <Text style={styles.statLabel}>Scheduled</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNum, {color: '#10b981'}]}>{sentCount}</Text>
                    <Text style={styles.statLabel}>Sent Logs</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNum, {color: '#ef4444'}]}>{failedCount}</Text>
                    <Text style={styles.statLabel}>Failed</Text>
                  </View>
                </View>

                <Button
                  mode="contained"
                  icon="cellphone-sound"
                  onPress={handleRunSimulation}
                  style={styles.simBtn}
                  buttonColor="#10b981"
                >
                  Send Scheduled Alerts
                </Button>
              </Card.Content>
            </Card>

            {/* List Logs */}
            <Text style={styles.logTitle}>Recent Outbox Activity Log</Text>
            {notifications.map((notif) => {
              let icon = 'clock-outline';
              let iconColor = '#0ea5e9';
              if (notif.status === 'Sent') {
                icon = 'check-circle-outline';
                iconColor = '#10b981';
              } else if (notif.status === 'Failed') {
                icon = 'alert-circle-outline';
                iconColor = '#ef4444';
              }

              return (
                <List.Item
                  key={notif.id}
                  title={notif.recipientName}
                  description={`${notif.message}\nStatus: ${notif.status} • Scheduled: ${notif.scheduledTime.split('T')[0]}`}
                  titleStyle={styles.logItemTitle}
                  descriptionStyle={styles.logItemDesc}
                  descriptionNumberOfLines={3}
                  style={styles.logItem}
                  left={props => <List.Icon {...props} icon={icon} color={iconColor} />}
                />
              );
            })}
          </View>
        )}

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  segmentBar: {
    margin: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#ffffff',
  },
  saveBtn: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 4,
  },
  simContainer: {
    gap: 16,
  },
  simCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  simCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  simCardText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    fontWeight: '500',
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  statBox: {
    width: '30%',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#334155',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 2,
  },
  simBtn: {
    borderRadius: 12,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 10,
  },
  logItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  logItemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  logItemDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 14,
    fontWeight: '500',
  },
});
