import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Alert } from 'react-native';
import { Card, Text, Button, TextInput, Surface, IconButton, Checkbox, HelperText } from 'react-native-paper';
import { useClinicStore } from '../../src/store/useClinicStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Medicine, Prescription } from '../../src/services/types';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function MobilePrescriptions() {
  const { prescriptions, patients, appointments, createPrescription } = useClinicStore();
  const { doctor } = useAuthStore();

  const [activeMode, setActiveMode] = useState<'list' | 'create' | 'view'>('list');
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  // Form states
  const [patientId, setPatientId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  
  // Single medicine entry state
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('1 tablet');
  const [medDuration, setMedDuration] = useState('5 days');
  const [medMorning, setMedMorning] = useState(true);
  const [medAfternoon, setMedAfternoon] = useState(false);
  const [medNight, setMedNight] = useState(true);

  // Recommended tests
  const [testsStr, setTestsStr] = useState('');

  const handleAddMedicine = () => {
    if (!medName) return;
    setMedicines([...medicines, {
      name: medName,
      dosage: medDosage,
      duration: medDuration,
      morning: medMorning,
      afternoon: medAfternoon,
      night: medNight
    }]);

    setMedName('');
    setMedDosage('1 tablet');
    setMedDuration('5 days');
    setMedMorning(true);
    setMedAfternoon(false);
    setMedNight(true);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = async () => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return alert('Please select a valid patient.');
    if (!diagnosis) return alert('Diagnosis is required.');

    const parsedTests = testsStr
      ? testsStr.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const newRx = await createPrescription({
      appointmentId: appointmentId || `apt-direct-${Date.now()}`,
      patientId,
      patientName: patient.fullName,
      date: new Date().toISOString().split('T')[0],
      symptoms,
      diagnosis,
      medicines,
      testsRecommended: parsedTests,
      notes,
      status: 'Finalized'
    });

    // Reset fields
    setPatientId('');
    setAppointmentId('');
    setSymptoms('');
    setDiagnosis('');
    setMedicines([]);
    setTestsStr('');
    setNotes('');

    setSelectedRx(newRx);
    setActiveMode('view');
  };

  // PDF Generator using expo-print
  const handlePrintPdf = async (rx: Prescription) => {
    const patient = patients.find(p => p.id === rx.patientId);

    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #334155; }
            .header { border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .doc-info { line-height: 1.4; }
            .doc-name { font-size: 20px; font-weight: bold; color: #1e293b; }
            .doc-spec { font-size: 13px; color: #0ea5e9; font-weight: bold; margin-top: 2px; }
            .clinic-info { text-align: right; line-height: 1.4; }
            .clinic-name { font-size: 16px; font-weight: bold; color: #10b981; }
            .patient-bar { background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 12px; font-size: 12px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(4, 1fr); }
            .section-title { font-size: 14px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-top: 24px; margin-bottom: 12px; }
            .rx-symbol { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 16px; }
            .med-item { font-size: 13px; font-weight: bold; margin-bottom: 12px; display: flex; justify-content: space-between; }
            .med-freq { font-size: 10px; color: #64748b; font-weight: normal; margin-top: 2px; }
            .test-item { font-size: 13px; font-weight: bold; margin-bottom: 6px; }
            .advice-text { font-size: 12px; color: #475569; font-style: italic; background-color: #f8fafc; padding: 12px; border-radius: 8px; }
            .footer { border-top: 1px solid #f1f5f9; padding-top: 40px; margin-top: 60px; font-size: 10px; text-align: right; color: #94a3b8; }
            .signature { border-bottom: 1px solid #cbd5e1; width: 150px; margin-left: auto; height: 30px; margin-bottom: 6px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="doc-info">
              <div class="doc-name">${doctor?.name}</div>
              <div class="doc-spec">${doctor?.specialization}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Reg No: ${doctor?.registrationNumber}</div>
            </div>
            <div class="clinic-info">
              <div class="clinic-name">${doctor?.clinicName}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${doctor?.clinicAddress}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Tel: ${doctor?.clinicPhone}</div>
            </div>
          </div>

          <table style="width: 100%; font-size: 12px; background-color: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 24px;">
            <tr>
              <td style="font-weight: bold; width: 25%">Patient Name:</td>
              <td style="color: #0f172a; font-weight: bold; width: 25%">${rx.patientName}</td>
              <td style="font-weight: bold; width: 25%">Rx Date:</td>
              <td style="color: #0f172a; font-weight: bold; width: 25%">${rx.date}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding-top: 6px;">Age / Gender:</td>
              <td style="color: #475569; padding-top: 6px;">${patient ? `${patient.age} Yrs / ${patient.gender}` : '--'}</td>
              <td style="font-weight: bold; padding-top: 6px;">Vitals:</td>
              <td style="color: #475569; padding-top: 6px;">${patient ? `${patient.height}cm / ${patient.weight}kg` : '--'}</td>
            </tr>
          </table>

          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Symptoms</div>
            <div style="font-size: 13px; font-weight: bold; color: #334155; margin-top: 4px;">${rx.symptoms}</div>
          </div>

          <div style="margin-bottom: 24px;">
            <div style="font-size: 11px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Diagnosis</div>
            <div style="font-size: 13px; font-weight: bold; color: #0ea5e9; margin-top: 4px;">${rx.diagnosis}</div>
          </div>

          <div class="rx-symbol">℞</div>
          
          <div style="min-height: 150px;">
            ${rx.medicines.map((m, idx) => `
              <div class="med-item">
                <div>
                  <div>${idx + 1}. ${m.name}</div>
                  <div class="med-freq">
                    Schedule: ${[m.morning ? 'Morning' : '', m.afternoon ? 'Afternoon' : '', m.night ? 'Night' : ''].filter(Boolean).join(' - ')}
                  </div>
                </div>
                <div style="text-align: right;">
                  <div>${m.dosage}</div>
                  <div style="font-size: 10px; color: #94a3b8; font-weight: normal; margin-top: 2px;">Duration: ${m.duration}</div>
                </div>
              </div>
            `).join('')}
            ${rx.medicines.length === 0 ? '<div style="font-size: 12px; color: #94a3b8; font-style: italic;">No medications prescribed.</div>' : ''}
          </div>

          ${rx.testsRecommended.length > 0 ? `
            <div class="section-title">Diagnostic Investigations</div>
            <div style="margin-bottom: 24px;">
              ${rx.testsRecommended.map(t => `<div class="test-item">• ${t}</div>`).join('')}
            </div>
          ` : ''}

          ${rx.notes ? `
            <div class="section-title">Clinical Advice Notes</div>
            <div class="advice-text">${rx.notes}</div>
          ` : ''}

          <div class="footer">
            <div class="signature"></div>
            <div>Authorized Signature / Seal</div>
            <div style="font-size: 8px; color: #cbd5e1; margin-top: 10px;">Aura Clinic ERP Automated Copy</div>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (e) {
      alert('Could not generate PDF: ' + e);
    }
  };

  return (
    <View style={styles.container}>
      
      {/* 1. REGISTRY VIEW */}
      {activeMode === 'list' && (
        <>
          <FlatList
            data={prescriptions}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <Card
                style={styles.rxCard}
                onPress={() => {
                  setSelectedRx(item);
                  setActiveMode('view');
                }}
              >
                <Card.Content style={styles.rxCardContent}>
                  <View style={styles.rxTextSection}>
                    <Text style={styles.rxPatient}>{item.patientName}</Text>
                    <Text style={styles.rxDate}>{item.date} • <Text style={styles.rxDx}>{item.diagnosis}</Text></Text>
                  </View>
                  <IconButton icon="file-pdf-box" iconColor="#ef4444" size={24} onPress={() => handlePrintPdf(item)} />
                </Card.Content>
              </Card>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No prescriptions filed in the registry.</Text>
            }
          />

          <Button
            mode="contained"
            icon="plus"
            onPress={() => {
              setSelectedRx(null);
              setActiveMode('create');
            }}
            style={styles.actionBtnBottom}
            buttonColor="#0ea5e9"
            labelStyle={styles.btnLabel}
          >
            Create Prescription
          </Button>
        </>
      )}

      {/* 2. CREATOR EDITOR VIEW */}
      {activeMode === 'create' && (
        <ScrollView style={styles.createScroll} contentContainerStyle={styles.createContainer}>
          <Text style={styles.sectionTitle}>Write New Prescription</Text>

          <Text style={styles.inputLabel}>Select Patient Profile</Text>
          <ScrollView style={{ maxHeight: 120, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 4, marginBottom: 12, backgroundColor: '#ffffff' }} nestedScrollEnabled={true}>
            {patients.map(p => {
              const isChosen = patientId === p.id;
              return (
                <Button
                  key={p.id}
                  mode={isChosen ? "contained-tonal" : "text"}
                  compact={true}
                  onPress={() => setPatientId(p.id)}
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
            label="Symptoms / Patient Complaint"
            value={symptoms}
            onChangeText={setSymptoms}
            mode="outlined"
            style={styles.formInput}
            activeOutlineColor="#0ea5e9"
          />

          <TextInput
            label="Final Diagnosis"
            value={diagnosis}
            onChangeText={setDiagnosis}
            mode="outlined"
            style={styles.formInput}
            activeOutlineColor="#0ea5e9"
          />

          {/* Medicines Sub-Form */}
          <Surface style={styles.subForm} elevation={0}>
            <Text style={styles.subFormTitle}>Medications Schedule</Text>

            {medicines.map((med, idx) => (
              <View key={idx} style={styles.medItemBadge}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medItemTitle}>{med.name} • {med.dosage}</Text>
                  <Text style={styles.medItemSub}>
                    {med.duration} • {[med.morning?'M':'', med.afternoon?'A':'', med.night?'N':''].filter(Boolean).join('/')}
                  </Text>
                </View>
                <IconButton icon="close" size={16} onPress={() => handleRemoveMedicine(idx)} />
              </View>
            ))}

            <View style={styles.nestedInputRow}>
              <TextInput
                label="Drug Name"
                value={medName}
                onChangeText={setMedName}
                mode="outlined"
                style={styles.nestedInput}
                activeOutlineColor="#0ea5e9"
              />
              <TextInput
                label="Dosage"
                value={medDosage}
                onChangeText={setMedDosage}
                mode="outlined"
                style={styles.nestedInput}
                activeOutlineColor="#0ea5e9"
              />
            </View>

            <TextInput
              label="Duration (e.g. 5 days)"
              value={medDuration}
              onChangeText={setMedDuration}
              mode="outlined"
              style={styles.formInput}
              activeOutlineColor="#0ea5e9"
            />

            <View style={styles.freqRow}>
              <View style={styles.checkboxItem}>
                <Checkbox
                  status={medMorning ? 'checked' : 'unchecked'}
                  onPress={() => setMedMorning(!medMorning)}
                  color="#0ea5e9"
                />
                <Text style={styles.checkboxLabel}>Morning</Text>
              </View>
              <View style={styles.checkboxItem}>
                <Checkbox
                  status={medAfternoon ? 'checked' : 'unchecked'}
                  onPress={() => setMedAfternoon(!medAfternoon)}
                  color="#0ea5e9"
                />
                <Text style={styles.checkboxLabel}>Afternoon</Text>
              </View>
              <View style={styles.checkboxItem}>
                <Checkbox
                  status={medNight ? 'checked' : 'unchecked'}
                  onPress={() => setMedNight(!medNight)}
                  color="#0ea5e9"
                />
                <Text style={styles.checkboxLabel}>Night</Text>
              </View>
            </View>

            <Button
              mode="outlined"
              onPress={handleAddMedicine}
              textColor="#0ea5e9"
              style={[styles.addMedBtn, { borderColor: '#0ea5e9' }]}
            >
              Add Medicine
            </Button>
          </Surface>

          <TextInput
            label="Recommended Tests (comma separated)"
            value={testsStr}
            onChangeText={setTestsStr}
            mode="outlined"
            style={styles.formInput}
            activeOutlineColor="#0ea5e9"
          />

          <TextInput
            label="Clinical Advice Notes"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.formInput}
            activeOutlineColor="#0ea5e9"
          />

          <View style={styles.formActions}>
            <Button
              mode="outlined"
              onPress={() => setActiveMode('list')}
              style={styles.cancelBtn}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateSubmit}
              style={styles.submitBtn}
              buttonColor="#0ea5e9"
            >
              Generate Rx
            </Button>
          </View>
        </ScrollView>
      )}

      {/* 3. RX SHEET PREVIEW VIEW */}
      {activeMode === 'view' && selectedRx && (
        <ScrollView style={styles.rxViewScroll}>
          <Surface style={styles.letterhead} elevation={0}>
            <IconButton icon="arrow-left" onPress={() => setActiveMode('list')} />
            <Text style={styles.letterheadTitle}>Prescription Sheet</Text>
            <IconButton icon="share-variant" iconColor="#0ea5e9" onPress={() => handlePrintPdf(selectedRx)} />
          </Surface>

          <Card style={styles.rxPrintCard}>
            <Card.Content>
              {/* Header block */}
              <View style={styles.prescriptionHeader}>
                <View>
                  <Text style={styles.rxDocName}>{doctor?.name}</Text>
                  <Text style={styles.rxDocSpec}>{doctor?.specialization}</Text>
                  <Text style={styles.rxDocReg}>Reg No: {doctor?.registrationNumber}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.rxClinicName}>{doctor?.clinicName}</Text>
                  <Text style={styles.rxClinicPhone}>Tel: {doctor?.clinicPhone}</Text>
                </View>
              </View>

              {/* Patient details */}
              <View style={styles.rxPatientSummary}>
                <Text style={styles.summaryText}>Patient Name: <Text style={{fontWeight: '800'}}>{selectedRx.patientName}</Text></Text>
                <Text style={styles.summaryText}>Date: {selectedRx.date}</Text>
              </View>

              {/* Diagnosis */}
              <View style={styles.rxBlock}>
                <Text style={styles.blockLabel}>Symptoms & Findings</Text>
                <Text style={styles.blockVal}>{selectedRx.symptoms}</Text>
              </View>

              <View style={styles.rxBlock}>
                <Text style={styles.blockLabel}>Clinical Diagnosis</Text>
                <Text style={[styles.blockVal, { color: '#0ea5e9', fontWeight: '800' }]}>{selectedRx.diagnosis}</Text>
              </View>

              {/* Medicines List */}
              <View style={styles.rxBlock}>
                <Text style={styles.rxSymbolText}>℞</Text>
                {selectedRx.medicines.map((m, idx) => (
                  <View key={idx} style={styles.rxMedRow}>
                    <Text style={styles.rxMedName}>{idx + 1}. {m.name} — <Text style={styles.rxMedInstruction}>{m.dosage} ({m.duration})</Text></Text>
                    <Text style={styles.rxMedFreq}>
                      Schedule: {[m.morning?'M':'', m.afternoon?'A':'', m.night?'N':''].filter(Boolean).join('/')}
                    </Text>
                  </View>
                ))}
              </View>

              {selectedRx.testsRecommended.length > 0 && (
                <View style={styles.rxBlock}>
                  <Text style={styles.blockLabel}>Diagnostics Ordered</Text>
                  {selectedRx.testsRecommended.map((t, idx) => (
                    <Text key={idx} style={styles.blockVal}>• {t}</Text>
                  ))}
                </View>
              )}

              {selectedRx.notes && (
                <View style={styles.rxBlock}>
                  <Text style={styles.blockLabel}>Clinical Guidelines</Text>
                  <Text style={styles.blockNotes}>"{selectedRx.notes}"</Text>
                </View>
              )}

              {/* Signature */}
              <View style={styles.rxFooter}>
                <View style={styles.sigLine}></View>
                <Text style={styles.sigLabel}>Authorized Sign / Stamp</Text>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  rxCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  rxCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rxTextSection: {
    flex: 1,
  },
  rxPatient: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  rxDate: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '600',
  },
  rxDx: {
    color: '#0ea5e9',
    fontWeight: '800',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  actionBtnBottom: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 14,
    paddingVertical: 6,
  },
  btnLabel: {
    fontWeight: '800',
  },
  createScroll: {
    flex: 1,
  },
  createContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
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
  formInput: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  subForm: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  subFormTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  medItemBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  medItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  medItemSub: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  nestedInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nestedInput: {
    width: '48%',
    backgroundColor: '#ffffff',
  },
  freqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#475569',
    marginLeft: -4,
  },
  addMedBtn: {
    marginTop: 8,
    borderRadius: 10,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelBtn: {
    width: '45%',
    borderRadius: 12,
  },
  submitBtn: {
    width: '50%',
    borderRadius: 12,
  },
  rxViewScroll: {
    flex: 1,
  },
  letterhead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  letterheadTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  rxPrintCard: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingBottom: 20,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 12,
    marginBottom: 16,
  },
  rxDocName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  rxDocSpec: {
    fontSize: 11,
    color: '#0ea5e9',
    fontWeight: '800',
    marginTop: 2,
  },
  rxDocReg: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2,
  },
  rxClinicName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10b981',
  },
  rxClinicPhone: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2,
  },
  rxPatientSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  rxBlock: {
    marginBottom: 16,
  },
  blockLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  blockVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 4,
  },
  rxSymbolText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 4,
    marginBottom: 8,
  },
  rxMedRow: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 6,
  },
  rxMedName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
  },
  rxMedInstruction: {
    color: '#64748b',
    fontWeight: '500',
  },
  rxMedFreq: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  blockNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#475569',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  rxFooter: {
    alignItems: 'flex-end',
    marginTop: 40,
  },
  sigLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    width: 140,
    height: 30,
    marginBottom: 4,
  },
  sigLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
  },
});
