import React from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, Surface, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useClinicStore } from '../../src/store/useClinicStore';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function MobileDashboard() {
  const router = useRouter();
  const { doctor } = useAuthStore();
  const { patients, appointments, prescriptions, followUps, initializeDb, sendScheduledNotifications, updateAppointment } = useClinicStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeDb();
    setRefreshing(false);
  };

  // Metrics
  const totalPatients = patients.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr && a.status !== 'Cancelled');
  const activeFollowups = followUps.filter((f) => f.status === 'Pending');
  const totalRx = prescriptions.length;

  const handleSimulate = async () => {
    await sendScheduledNotifications();
    alert('Simulation complete! Mobile notifications log refreshed.');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Clinic Greeting Banner */}
      <Surface style={styles.banner} elevation={0}>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.greeting}>Hello, {doctor?.name?.split(' ')[1] || 'Doctor'}</Text>
          <Text style={styles.bannerSubtitle}>{doctor?.clinicName || 'Aura Clinic'}</Text>
        </View>
        <IconButton
          icon="bell-ring"
          iconColor="#0ea5e9"
          size={24}
          onPress={handleSimulate}
          style={styles.simulateButton}
        />
      </Surface>

      {/* Metrics Row */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <Card.Content style={styles.metricContent}>
            <Text style={styles.metricIcon}>👥</Text>
            <Text style={styles.metricVal}>{totalPatients}</Text>
            <Text style={styles.metricLabel}>Patients</Text>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content style={styles.metricContent}>
            <Text style={styles.metricIcon}>📅</Text>
            <Text style={styles.metricVal}>{todayAppointments.length}</Text>
            <Text style={styles.metricLabel}>Today's Visits</Text>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content style={styles.metricContent}>
            <Text style={styles.metricIcon}>🔔</Text>
            <Text style={styles.metricVal}>{activeFollowups.length}</Text>
            <Text style={styles.metricLabel}>Follow Ups</Text>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content style={styles.metricContent}>
            <Text style={styles.metricIcon}>📄</Text>
            <Text style={styles.metricVal}>{totalRx}</Text>
            <Text style={styles.metricLabel}>Written Rx</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Operations Actions */}
      <Surface style={styles.actionsPanel} elevation={0}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionRow}>
          <Button
            mode="outlined"
            onPress={() => router.push('/(tabs)/patients')}
            style={[styles.actionBtn, { borderColor: '#e2e8f0' }]}
            textColor="#0ea5e9"
            icon="account-multiple-plus"
          >
            New Patient
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push('/(tabs)/appointments')}
            style={[styles.actionBtn, { borderColor: '#e2e8f0' }]}
            textColor="#0ea5e9"
            icon="calendar"
          >
            Book Visit
          </Button>
        </View>
      </Surface>

      {/* Patient Queue section */}
      <View style={styles.queueContainer}>
        <Text style={styles.sectionTitle}>Today's Scheduled Queue</Text>
        {todayAppointments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>🗓️</Text>
              <Text style={styles.emptyText}>No appointments booked for today</Text>
              <Button
                mode="text"
                onPress={() => router.push('/(tabs)/appointments')}
                textColor="#0ea5e9"
              >
                Schedule Now
              </Button>
            </Card.Content>
          </Card>
        ) : (
          todayAppointments.map((apt) => (
            <Card key={apt.id} style={styles.queueCard}>
              <Card.Content style={styles.queueContent}>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>{apt.time}</Text>
                </View>
                <View style={styles.queueInfo}>
                  <Text style={styles.patientName}>{apt.patientName}</Text>
                  <Text style={styles.visitReason}>Reason: {apt.reasonForVisit}</Text>
                </View>
                {apt.status !== 'Completed' ? (
                  <Button
                    mode="contained-tonal"
                    onPress={async () => {
                      await updateAppointment(apt.id, { status: 'Completed' });
                    }}
                    buttonColor="#f0f9ff"
                    textColor="#0ea5e9"
                    style={styles.completeButton}
                    labelStyle={styles.completeBtnLabel}
                  >
                    Done
                  </Button>
                ) : (
                  <Text style={styles.completedBadge}>✓ Done</Text>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bannerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  bannerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 2,
  },
  simulateButton: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  metricContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 2,
  },
  actionsPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: '48%',
    borderRadius: 12,
  },
  queueContainer: {
    marginBottom: 20,
  },
  queueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  queueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  timeBadge: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  queueInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  patientName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  visitReason: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  completeButton: {
    borderRadius: 8,
  },
  completeBtnLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginVertical: 4,
    marginHorizontal: 8,
  },
  completedBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10b981',
    marginRight: 10,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
});
