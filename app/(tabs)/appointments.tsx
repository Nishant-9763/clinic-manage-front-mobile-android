import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Alert } from 'react-native';
import { Card, Text, Button, TextInput, Surface, SegmentedButtons, Portal, Modal, IconButton } from 'react-native-paper';
import { useClinicStore } from '../../src/store/useClinicStore';
import { Appointment } from '../../src/services/types';

export default function MobileAppointments() {
  const { 
    appointments, patients, createAppointment, updateAppointment, cancelAppointment, markAppointmentComplete 
  } = useClinicStore();

  const [activeSegment, setActiveSegment] = useState('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  // Forms
  const [formData, setFormData] = useState({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    reasonForVisit: 'General Consultation',
    notes: ''
  });

  const [rescheduleData, setRescheduleData] = useState({
    id: '',
    date: '',
    time: ''
  });

  const todayStr = new Date().toISOString().split('T')[0];

  // Filters based on activeSegment
  const filteredAppointments = appointments.filter((apt) => {
    if (activeSegment === 'today') {
      return apt.date === todayStr && apt.status !== 'Cancelled';
    }
    if (activeSegment === 'upcoming') {
      return apt.date > todayStr && apt.status !== 'Cancelled' && apt.status !== 'Completed';
    }
    if (activeSegment === 'completed') {
      return apt.status === 'Completed';
    }
    return true; // fallback
  });

  const handleAddSubmit = async () => {
    const patient = patients.find(p => p.id === formData.patientId);
    if (!patient) {
      alert('Please select a valid patient.');
      return;
    }

    await createAppointment({
      patientId: patient.id,
      patientName: patient.fullName,
      date: formData.date,
      time: formData.time,
      status: 'Confirmed',
      reasonForVisit: formData.reasonForVisit,
      notes: formData.notes
    });

    setShowAddModal(false);
    setFormData({
      patientId: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      reasonForVisit: 'General Consultation',
      notes: ''
    });
  };

  const handleRescheduleSubmit = async () => {
    await updateAppointment(rescheduleData.id, {
      date: rescheduleData.date,
      time: rescheduleData.time,
      status: 'Confirmed'
    });
    setShowRescheduleModal(false);
    setSelectedApt(null);
  };

  const handleCancel = (id: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await cancelAppointment(id);
            setSelectedApt(null);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      
      {/* Tab Segment selectors */}
      <SegmentedButtons
        value={activeSegment}
        onValueChange={setActiveSegment}
        style={styles.segmentBar}
        buttons={[
          { value: 'today', label: 'Today', checkedColor: '#0ea5e9' },
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'completed', label: 'Completed' },
        ]}
      />

      {/* Scheduler list */}
      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Card
            style={styles.aptCard}
            onPress={() => setSelectedApt(item)}
          >
            <Card.Content style={styles.aptCardContent}>
              <View style={styles.timeSection}>
                <Text style={styles.timeText}>{item.time}</Text>
                <Text style={styles.dateText}>{item.date.split('-')[2]}/{item.date.split('-')[1]}</Text>
              </View>
              <View style={styles.infoSection}>
                <Text style={styles.patientName}>{item.patientName}</Text>
                <Text style={styles.reasonText} numberOfLines={1}>{item.reasonForVisit}</Text>
              </View>
              <View style={styles.statusSection}>
                <Text style={[styles.statusText, item.status === 'Completed' ? styles.statusDone : null]}>
                  {item.status}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No appointments booked for this filter.</Text>
        }
      />

      {/* Book appointment button */}
      <Button
        mode="contained"
        icon="plus"
        onPress={() => setShowAddModal(true)}
        style={styles.bookButton}
        buttonColor="#0ea5e9"
        labelStyle={styles.bookBtnLabel}
      >
        Book Appointment
      </Button>

      {/* PORTAL FOR DIALOGS */}
      <Portal>
        
        {/* VIEW APPOINTMENT SHEET MODAL */}
        <Modal
          visible={!!selectedApt}
          onDismiss={() => setSelectedApt(null)}
          contentContainerStyle={styles.detailsModal}
        >
          {selectedApt ? (
            <View style={styles.detailsContent}>
              <View style={styles.detailsHeader}>
                <Text style={styles.detailsTitle}>Appointment details</Text>
                <IconButton icon="close" size={20} onPress={() => setSelectedApt(null)} />
              </View>

              <View style={styles.detailsBody}>
                <Text style={styles.detailLabel}>Patient Name</Text>
                <Text style={styles.detailValue}>{selectedApt.patientName}</Text>

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>{selectedApt.date}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>Time Slot</Text>
                    <Text style={styles.detailValue}>{selectedApt.time}</Text>
                  </View>
                </View>

                <Text style={styles.detailLabel}>Reason for consultation</Text>
                <Text style={styles.detailValue}>{selectedApt.reasonForVisit}</Text>

                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[styles.detailValue, { color: selectedApt.status === 'Completed' ? '#10b981' : '#0ea5e9' }]}>
                  {selectedApt.status}
                </Text>

                {selectedApt.notes ? (
                  <>
                    <Text style={styles.detailLabel}>Doctor Annotations</Text>
                    <Text style={styles.detailNotes}>"{selectedApt.notes}"</Text>
                  </>
                ) : null}
              </View>

              {selectedApt.status !== 'Completed' && selectedApt.status !== 'Cancelled' ? (
                <View style={styles.detailsActions}>
                  <Button
                    mode="contained"
                    onPress={async () => {
                      await markAppointmentComplete(selectedApt.id);
                      setSelectedApt(null);
                    }}
                    buttonColor="#10b981"
                    style={styles.actionBtn}
                  >
                    Complete
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setRescheduleData({
                        id: selectedApt.id,
                        date: selectedApt.date,
                        time: selectedApt.time
                      });
                      setShowRescheduleModal(true);
                    }}
                    textColor="#475569"
                    style={[styles.actionBtn, { borderColor: '#cbd5e1' }]}
                  >
                    Reschedule
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => handleCancel(selectedApt.id)}
                    textColor="#ef4444"
                    style={styles.actionBtn}
                  >
                    Cancel Visit
                  </Button>
                </View>
              ) : null}
            </View>
          ) : null}
        </Modal>

        {/* BOOK APPOINTMENT MODAL */}
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.addModal}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>Book New Visit</Text>

            <Text style={styles.inputLabel}>Select Patient Profile</Text>
            <ScrollView style={{ maxHeight: 120, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 4, marginBottom: 12, backgroundColor: '#ffffff' }} nestedScrollEnabled={true}>
              {patients.map(p => {
                const isChosen = formData.patientId === p.id;
                return (
                  <Button
                    key={p.id}
                    mode={isChosen ? "contained-tonal" : "text"}
                    compact={true}
                    onPress={() => setFormData({ ...formData, patientId: p.id })}
                    style={{ marginVertical: 2, borderRadius: 8 }}
                    textColor={isChosen ? '#0284c7' : '#475569'}
                    contentStyle={{ justifyContent: 'flex-start' }}
                  >
                    {p.fullName} ({p.mobile})
                  </Button>
                );
              })}
            </ScrollView>

            <TextInput
              label="Appointment Date (YYYY-MM-DD)"
              value={formData.date}
              onChangeText={(t) => setFormData({ ...formData, date: t })}
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Time Slot (e.g. 10:30)"
              value={formData.time}
              onChangeText={(t) => setFormData({ ...formData, time: t })}
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Reason for Visit"
              value={formData.reasonForVisit}
              onChangeText={(t) => setFormData({ ...formData, reasonForVisit: t })}
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Doctor Annotations"
              value={formData.notes}
              onChangeText={(t) => setFormData({ ...formData, notes: t })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.modalInput}
              activeOutlineColor="#0ea5e9"
            />

            <View style={styles.modalActionsRow}>
              <Button onPress={() => setShowAddModal(false)}>Cancel</Button>
              <Button mode="contained" onPress={handleAddSubmit} buttonColor="#0ea5e9">Book Visit</Button>
            </View>
          </ScrollView>
        </Modal>

        {/* RESCHEDULE MODAL */}
        <Modal
          visible={showRescheduleModal}
          onDismiss={() => setShowRescheduleModal(false)}
          contentContainerStyle={styles.rescheduleModal}
        >
          <Text style={styles.modalTitle}>Reschedule Visit</Text>

          <TextInput
            label="New Date (YYYY-MM-DD)"
            value={rescheduleData.date}
            onChangeText={(t) => setRescheduleData({ ...rescheduleData, date: t })}
            mode="outlined"
            style={styles.modalInput}
            activeOutlineColor="#0ea5e9"
          />

          <TextInput
            label="New Time Slot"
            value={rescheduleData.time}
            onChangeText={(t) => setRescheduleData({ ...rescheduleData, time: t })}
            mode="outlined"
            style={styles.modalInput}
            activeOutlineColor="#0ea5e9"
          />

          <View style={styles.modalActionsRow}>
            <Button onPress={() => setShowRescheduleModal(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleRescheduleSubmit} buttonColor="#0ea5e9">Confirm</Button>
          </View>
        </Modal>

      </Portal>

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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  aptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  aptCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  timeSection: {
    width: '25%',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
    paddingRight: 8,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  dateText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 2,
  },
  infoSection: {
    flex: 1,
    paddingLeft: 12,
  },
  patientName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  reasonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  statusSection: {
    paddingLeft: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0ea5e9',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  statusDone: {
    color: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  bookButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  bookBtnLabel: {
    fontWeight: '800',
  },
  detailsModal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 24,
  },
  detailsContent: {
    gap: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  detailsBody: {
    marginVertical: 12,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 10,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  detailNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  detailsActions: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: '48%',
    borderRadius: 10,
    marginBottom: 8,
  },
  addModal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 24,
    maxHeight: '80%',
  },
  rescheduleModal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
  },
  selectBorder: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  htmlSelect: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 0,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  modalInput: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
});
