import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Alert } from 'react-native';
import { Card, Text, Button, TextInput, Surface, FAB, IconButton, Portal, Modal, SegmentedButtons } from 'react-native-paper';
import { useClinicStore } from '../../src/store/useClinicStore';
import { Patient } from '../../src/services/types';

export default function MobilePatients() {
  const { patients, appointments, prescriptions, followUps, addPatient, updatePatient, deletePatient } = useClinicStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  // Tab within patient detail
  const [activeSegment, setActiveSegment] = useState('overview');

  // Modal forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    gender: 'Male' as Patient['gender'],
    age: '30',
    dob: '1996-01-01',
    bloodGroup: 'O+',
    height: '170',
    weight: '70',
    address: '',
    allergies: '',
    notes: ''
  });

  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.mobile.includes(searchQuery)
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  // EMR Timeline items
  const patientAppointments = appointments.filter(a => a.patientId === selectedPatientId);
  const patientPrescriptions = prescriptions.filter(pr => pr.patientId === selectedPatientId);
  const patientFollowups = followUps.filter(f => f.patientId === selectedPatientId);

  const resetForm = () => {
    setFormData({
      fullName: '',
      mobile: '',
      gender: 'Male',
      age: '30',
      dob: '1996-01-01',
      bloodGroup: 'O+',
      height: '170',
      weight: '70',
      address: '',
      allergies: '',
      notes: ''
    });
  };

  const handleAddSubmit = async () => {
    if (!formData.fullName || !formData.mobile) {
      alert('Please fill in name and mobile.');
      return;
    }

    const formattedAllergies = formData.allergies
      ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const newPatient = await addPatient({
      fullName: formData.fullName,
      mobile: formData.mobile,
      gender: formData.gender,
      age: parseInt(formData.age) || 30,
      dob: formData.dob,
      bloodGroup: formData.bloodGroup,
      height: parseInt(formData.height) || 170,
      weight: parseInt(formData.weight) || 70,
      address: formData.address,
      allergies: formattedAllergies,
      notes: formData.notes
    });

    setShowAddModal(false);
    resetForm();
    setSelectedPatientId(newPatient.id);
  };

  const handleEditOpen = () => {
    if (!selectedPatient) return;
    setFormData({
      fullName: selectedPatient.fullName,
      mobile: selectedPatient.mobile,
      gender: selectedPatient.gender,
      age: String(selectedPatient.age),
      dob: selectedPatient.dob,
      bloodGroup: selectedPatient.bloodGroup,
      height: String(selectedPatient.height),
      weight: String(selectedPatient.weight),
      address: selectedPatient.address,
      allergies: selectedPatient.allergies.join(', '),
      notes: selectedPatient.notes
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedPatientId) return;

    const formattedAllergies = formData.allergies
      ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    await updatePatient(selectedPatientId, {
      fullName: formData.fullName,
      mobile: formData.mobile,
      gender: formData.gender,
      age: parseInt(formData.age) || 30,
      dob: formData.dob,
      bloodGroup: formData.bloodGroup,
      height: parseInt(formData.height) || 170,
      weight: parseInt(formData.weight) || 70,
      address: formData.address,
      allergies: formattedAllergies,
      notes: formData.notes
    });

    setShowEditModal(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Patient',
      `Are you sure you want to delete ${selectedPatient?.fullName}? All medical records will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (selectedPatientId) {
              await deletePatient(selectedPatientId);
              setSelectedPatientId(null);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      
      {/* 1. LIST VIEW */}
      {!selectedPatient ? (
        <>
          <TextInput
            placeholder="Search by name or mobile..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            activeOutlineColor="#0ea5e9"
            style={styles.searchBar}
            left={<TextInput.Icon icon="magnify" />}
          />

          <FlatList
            data={filteredPatients}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <Card
                style={styles.patientCard}
                onPress={() => {
                  setSelectedPatientId(item.id);
                  setActiveSegment('overview');
                }}
              >
                <Card.Title
                  title={item.fullName}
                  subtitle={`${item.gender} • ${item.age} Yrs • ${item.mobile}`}
                  titleStyle={styles.patientName}
                  subtitleStyle={styles.patientSub}
                  right={(props) => <IconButton {...props} icon="chevron-right" iconColor="#94a3b8" />}
                />
              </Card>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No registered patient files match search.</Text>
            }
          />

          <FAB
            icon="plus"
            style={styles.fab}
            color="#ffffff"
            onPress={() => {
              resetForm();
              setShowAddModal(true);
            }}
          />
        </>
      ) : (
        /* 2. PATIENT DETAILS WORKSPACE */
        <View style={styles.detailContainer}>
          {/* Header toolbar */}
          <Surface style={styles.detailHeader} elevation={0}>
            <IconButton icon="arrow-left" onPress={() => setSelectedPatientId(null)} />
            <Text style={styles.headerTitle} numberOfLines={1}>
              {selectedPatient.fullName}
            </Text>
            <View style={styles.headerActions}>
              <IconButton icon="pencil-outline" onPress={handleEditOpen} iconColor="#0284c7" />
              <IconButton icon="trash-can-outline" onPress={handleDelete} iconColor="#f43f5e" />
            </View>
          </Surface>

          {/* Quick info row */}
          <View style={styles.vitalHeader}>
            <Text style={styles.vitalSubText}>{selectedPatient.gender} • {selectedPatient.age} Yrs • Cell: {selectedPatient.mobile}</Text>
          </View>

          {/* Tab selectors */}
          <SegmentedButtons
            value={activeSegment}
            onValueChange={setActiveSegment}
            style={styles.segmentBar}
            buttons={[
              { value: 'overview', label: 'Info', checkedColor: '#0ea5e9' },
              { value: 'appointments', label: 'Visits' },
              { value: 'prescriptions', label: 'Rx' },
              { value: 'followups', label: 'Follow' },
            ]}
          />

          <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailScrollContent}>
            
            {/* A. OVERVIEW TAB */}
            {activeSegment === 'overview' && (
              <View style={styles.tabContent}>
                <Card style={styles.infoCard}>
                  <Card.Content>
                    <Text style={styles.cardHeader}>🏥 Clinical Vitals</Text>
                    <View style={styles.vitalsRow}>
                      <View style={styles.vitalItem}>
                        <Text style={styles.vitalLabel}>Height</Text>
                        <Text style={styles.vitalVal}>{selectedPatient.height} cm</Text>
                      </View>
                      <View style={styles.vitalItem}>
                        <Text style={styles.vitalLabel}>Weight</Text>
                        <Text style={styles.vitalVal}>{selectedPatient.weight} kg</Text>
                      </View>
                      <View style={styles.vitalItem}>
                        <Text style={styles.vitalLabel}>Blood Group</Text>
                        <Text style={styles.vitalVal}>{selectedPatient.bloodGroup}</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>

                <Card style={styles.infoCard}>
                  <Card.Content>
                    <Text style={styles.cardHeader}>⚠️ Active Allergies</Text>
                    {selectedPatient.allergies.length > 0 ? (
                      <View style={styles.allergyContainer}>
                        {selectedPatient.allergies.map((a, i) => (
                          <View key={i} style={styles.allergyBadge}>
                            <Text style={styles.allergyText}>⚠️ {a}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.noDataText}>No allergies declared.</Text>
                    )}
                  </Card.Content>
                </Card>

                <Card style={styles.infoCard}>
                  <Card.Content>
                    <Text style={styles.cardHeader}>📄 General Annotations</Text>
                    <Text style={styles.clinicalNotes}>{selectedPatient.notes || 'No notes available.'}</Text>
                  </Card.Content>
                </Card>

                <Card style={styles.infoCard}>
                  <Card.Content>
                    <Text style={styles.cardHeader}>📍 Contact Address</Text>
                    <Text style={styles.addressText}>{selectedPatient.address || 'No address recorded.'}</Text>
                  </Card.Content>
                </Card>
              </View>
            )}

            {/* B. APPOINTMENTS TAB */}
            {activeSegment === 'appointments' && (
              <View style={styles.tabContent}>
                {patientAppointments.map((apt) => (
                  <Card key={apt.id} style={styles.itemCard}>
                    <Card.Content>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle}>{apt.date} • {apt.time}</Text>
                        <Text style={styles.itemStatus}>{apt.status}</Text>
                      </View>
                      <Text style={styles.itemBody}>Reason: {apt.reasonForVisit}</Text>
                      {apt.notes ? <Text style={styles.itemNotes}>"{apt.notes}"</Text> : null}
                    </Card.Content>
                  </Card>
                ))}
                {patientAppointments.length === 0 ? (
                  <Text style={styles.noDataText}>No appointments scheduled.</Text>
                ) : null}
              </View>
            )}

            {/* C. PRESCRIPTIONS TAB */}
            {activeSegment === 'prescriptions' && (
              <View style={styles.tabContent}>
                {patientPrescriptions.map((rx) => (
                  <Card key={rx.id} style={styles.itemCard}>
                    <Card.Content>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle}>{rx.date}</Text>
                        <Text style={styles.rxDx}>{rx.diagnosis}</Text>
                      </View>
                      <Text style={styles.itemBody}>
                        Meds: {rx.medicines.map(m => `${m.name} (${m.duration})`).join(', ')}
                      </Text>
                      {rx.testsRecommended.length > 0 ? (
                        <Text style={styles.itemNotes}>Tests: {rx.testsRecommended.join(', ')}</Text>
                      ) : null}
                    </Card.Content>
                  </Card>
                ))}
                {patientPrescriptions.length === 0 ? (
                  <Text style={styles.noDataText}>No prescriptions found.</Text>
                ) : null}
              </View>
            )}

            {/* D. FOLLOWUPS TAB */}
            {activeSegment === 'followups' && (
              <View style={styles.tabContent}>
                {patientFollowups.map((f) => (
                  <Card key={f.id} style={styles.itemCard}>
                    <Card.Content>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle}>Due: {f.dueDate}</Text>
                        <Text style={styles.itemStatus}>{f.status}</Text>
                      </View>
                      <Text style={styles.itemBody}>Notes: {f.notes}</Text>
                    </Card.Content>
                  </Card>
                ))}
                {patientFollowups.length === 0 ? (
                  <Text style={styles.noDataText}>No follow ups scheduled.</Text>
                ) : null}
              </View>
            )}

          </ScrollView>
        </View>
      )}

      {/* PORTAL FOR MODALS */}
      <Portal>
        
        {/* ADD PATIENT MODAL */}
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>Register Patient Profile</Text>

            <TextInput
              label="Full Name"
              value={formData.fullName}
              onChangeText={(t) => setFormData({ ...formData, fullName: t })}
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Mobile Number"
              value={formData.mobile}
              onChangeText={(t) => setFormData({ ...formData, mobile: t })}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor="#0ea5e9"
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <TextInput
                  label="Age"
                  value={formData.age}
                  onChangeText={(t) => setFormData({ ...formData, age: t })}
                  keyboardType="numeric"
                  mode="outlined"
                  activeOutlineColor="#0ea5e9"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  label="Blood Group"
                  value={formData.bloodGroup}
                  onChangeText={(t) => setFormData({ ...formData, bloodGroup: t })}
                  mode="outlined"
                  activeOutlineColor="#0ea5e9"
                />
              </View>
            </View>

            <View style={[styles.row, { marginTop: 12 }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <TextInput
                  label="Height (cm)"
                  value={formData.height}
                  onChangeText={(t) => setFormData({ ...formData, height: t })}
                  keyboardType="numeric"
                  mode="outlined"
                  activeOutlineColor="#0ea5e9"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  label="Weight (kg)"
                  value={formData.weight}
                  onChangeText={(t) => setFormData({ ...formData, weight: t })}
                  keyboardType="numeric"
                  mode="outlined"
                  activeOutlineColor="#0ea5e9"
                />
              </View>
            </View>

            <TextInput
              label="Allergies (comma separated)"
              value={formData.allergies}
              onChangeText={(t) => setFormData({ ...formData, allergies: t })}
              mode="outlined"
              style={[styles.modalInput, { marginTop: 12 }]}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Address"
              value={formData.address}
              onChangeText={(t) => setFormData({ ...formData, address: t })}
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Overview Notes"
              value={formData.notes}
              onChangeText={(t) => setFormData({ ...formData, notes: t })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.modalInput}
              activeOutlineColor="#0ea5e9"
            />

            <View style={styles.modalActions}>
              <Button onPress={() => setShowAddModal(false)} style={styles.modalBtn}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleAddSubmit} style={styles.modalBtn} buttonColor="#0ea5e9">
                Register
              </Button>
            </View>
          </ScrollView>
        </Modal>

        {/* EDIT PATIENT MODAL */}
        <Modal
          visible={showEditModal}
          onDismiss={() => setShowEditModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>Edit Patient Card</Text>

            <TextInput
              label="Full Name"
              value={formData.fullName}
              onChangeText={(t) => setFormData({ ...formData, fullName: t })}
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Mobile Number"
              value={formData.mobile}
              onChangeText={(t) => setFormData({ ...formData, mobile: t })}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor="#0ea5e9"
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <TextInput
                  label="Age"
                  value={formData.age}
                  onChangeText={(t) => setFormData({ ...formData, age: t })}
                  keyboardType="numeric"
                  mode="outlined"
                  activeOutlineColor="#0ea5e9"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  label="Blood Group"
                  value={formData.bloodGroup}
                  onChangeText={(t) => setFormData({ ...formData, bloodGroup: t })}
                  mode="outlined"
                  activeOutlineColor="#0ea5e9"
                />
              </View>
            </View>

            <View style={[styles.row, { marginTop: 12 }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <TextInput
                  label="Height (cm)"
                  value={formData.height}
                  onChangeText={(t) => setFormData({ ...formData, height: t })}
                  keyboardType="numeric"
                  mode="outlined"
                  activeOutlineColor="#0ea5e9"
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  label="Weight (kg)"
                  value={formData.weight}
                  onChangeText={(t) => setFormData({ ...formData, weight: t })}
                  keyboardType="numeric"
                  mode="outlined"
                  activeOutlineColor="#0ea5e9"
                />
              </View>
            </View>

            <TextInput
              label="Allergies (comma separated)"
              value={formData.allergies}
              onChangeText={(t) => setFormData({ ...formData, allergies: t })}
              mode="outlined"
              style={[styles.modalInput, { marginTop: 12 }]}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Address"
              value={formData.address}
              onChangeText={(t) => setFormData({ ...formData, address: t })}
              mode="outlined"
              style={styles.modalInput}
              activeOutlineColor="#0ea5e9"
            />

            <TextInput
              label="Overview Notes"
              value={formData.notes}
              onChangeText={(t) => setFormData({ ...formData, notes: t })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.modalInput}
              activeOutlineColor="#0ea5e9"
            />

            <View style={styles.modalActions}>
              <Button onPress={() => setShowEditModal(false)} style={styles.modalBtn}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleEditSubmit} style={styles.modalBtn} buttonColor="#0ea5e9">
                Save
              </Button>
            </View>
          </ScrollView>
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
  searchBar: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  patientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  patientName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  patientSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 8,
    bottom: 8,
    backgroundColor: '#0ea5e9',
    borderRadius: 16,
  },
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingTop: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  vitalHeader: {
    backgroundColor: '#ffffff',
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  vitalSubText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  segmentBar: {
    margin: 16,
  },
  detailScroll: {
    flex: 1,
  },
  detailScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vitalItem: {
    alignItems: 'center',
    width: '30%',
  },
  vitalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
  vitalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  allergyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allergyBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  allergyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ef4444',
  },
  clinicalNotes: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    fontWeight: '500',
  },
  addressText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  itemStatus: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0ea5e9',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemBody: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  itemNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#94a3b8',
    marginTop: 4,
  },
  rxDx: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0ea5e9',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalBtn: {
    marginLeft: 8,
  },
});
