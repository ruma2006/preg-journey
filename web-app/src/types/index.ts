// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  MEDICAL_OFFICER = 'MEDICAL_OFFICER',
  MCH_OFFICER = 'MCH_OFFICER',
  DOCTOR = 'DOCTOR',
  HELP_DESK = 'HELP_DESK',
}

export enum RiskLevel {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED',
}

export enum PatientStatus {
  ACTIVE = 'ACTIVE',
  UNDER_OBSERVATION = 'UNDER_OBSERVATION',
  DISCHARGED = 'DISCHARGED',
  REFERRED = 'REFERRED',
  INACTIVE = 'INACTIVE',
}

export enum ConsultationType {
  TELECONSULTATION = 'TELECONSULTATION',
  IN_PERSON = 'IN_PERSON',
  EMERGENCY = 'EMERGENCY',
}

export enum ConsultationStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum FollowUpStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  NO_ANSWER = 'NO_ANSWER',
  RESCHEDULED = 'RESCHEDULED',
  CANCELLED = 'CANCELLED',
}

export enum DeliveryOutcome {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  MOTHER_MORTALITY = 'MOTHER_MORTALITY',
  BABY_MORTALITY = 'BABY_MORTALITY',
  BOTH_MORTALITY = 'BOTH_MORTALITY',
}

export enum DeliveryType {
  NORMAL = 'NORMAL',
  CESAREAN = 'CESAREAN',
  ASSISTED = 'ASSISTED',
  INDUCED = 'INDUCED',
}

export enum AlertType {
  HIGH_RISK_DETECTED = 'HIGH_RISK_DETECTED',
  CRITICAL_VITALS = 'CRITICAL_VITALS',
  MISSED_APPOINTMENT = 'MISSED_APPOINTMENT',
  OVERDUE_FOLLOWUP = 'OVERDUE_FOLLOWUP',
  COMPLICATION_REPORTED = 'COMPLICATION_REPORTED',
  EMERGENCY = 'EMERGENCY',
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Auth
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}

// User
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department?: string;
  designation?: string;
  isActive: boolean;
  profileImageUrl?: string;
  createdAt: string;
}

export interface UserRegistrationRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  department?: string;
  designation?: string;
}

// Patient
export interface Patient {
  id: number;
  name: string;
  age: number;
  husbandName?: string;
  residence: string;
  district?: string;
  mandal?: string;
  village?: string;
  pincode?: string;
  motherId: string;
  aadhaarNumber: string;
  mobileNumber: string;
  alternateMobile?: string;
  email?: string;
  dateOfBirth?: string;
  lmpDate?: string;
  eddDate?: string;
  gravida?: number;
  para?: number;
  bloodGroup?: string;
  currentRiskLevel: RiskLevel;
  currentRiskScore: number;
  status: PatientStatus;
  hasPreviousComplications: boolean;
  previousComplicationsDetails?: string;
  medicalHistory?: string;
  allergies?: string;
  registrationDate: string;
  // Delivery Information
  deliveryOutcome?: DeliveryOutcome;
  deliveryType?: DeliveryType;
  deliveryDate?: string;
  deliveryCompletedAt?: string;
  deliveryNotes?: string;
  babyWeight?: number;
  babyGender?: string;
  deliveryHospital?: string;
  deliveryCompletedBy?: User;
  // Mortality Information
  mortalityDate?: string;
  mortalityCause?: string;
  mortalityNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientRegistrationRequest {
  name: string;
  age: number;
  husbandName?: string;
  residence: string;
  district?: string;
  mandal?: string;
  village?: string;
  pincode?: string;
  aadhaarNumber: string;
  mobileNumber: string;
  alternateMobile?: string;
  email?: string;
  dateOfBirth?: string;
  lmpDate?: string;
  gravida?: number;
  para?: number;
  bloodGroup?: string;
  hasPreviousComplications?: boolean;
  previousComplicationsDetails?: string;
  medicalHistory?: string;
  allergies?: string;
}

export interface DeliveryCompletionRequest {
  deliveryOutcome: DeliveryOutcome;
  deliveryType: DeliveryType;
  deliveryDate: string;
  deliveryNotes?: string;
  babyWeight?: number;
  babyGender?: string;
  deliveryHospital?: string;
  mortalityDate?: string;
  mortalityCause?: string;
  mortalityNotes?: string;
}

// Health Check
export interface HealthCheck {
  id: number;
  patient: Patient;
  checkDate: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  pulseRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  spo2?: number;
  hemoglobin?: number;
  bloodSugarFasting?: number;
  bloodSugarPP?: number;
  bloodSugarRandom?: number;
  weight?: number;
  height?: number;
  fundalHeight?: number;
  fetalHeartRate?: number;
  fetalMovement?: boolean;
  urineAlbumin?: string;
  urineSugar?: string;
  symptoms?: string;
  swellingObserved?: boolean;
  bleedingReported?: boolean;
  headacheReported?: boolean;
  blurredVisionReported?: boolean;
  abdominalPainReported?: boolean;
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors?: string;
  notes?: string;
  recommendations?: string;
  nextCheckDate?: string;
  createdAt: string;
}

export interface HealthCheckRequest {
  id: number; // Include ID for updates, can be optional for creation
  patientId: number;
  checkDate?: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  pulseRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  spo2?: number;
  hemoglobin?: number;
  bloodSugarFasting?: number;
  bloodSugarPP?: number;
  bloodSugarRandom?: number;
  weight?: number;
  height?: number;
  fundalHeight?: number;
  fetalHeartRate?: number;
  fetalMovement?: boolean;
  urineAlbumin?: string;
  urineSugar?: string;
  symptoms?: string;
  swellingObserved?: boolean;
  bleedingReported?: boolean;
  headacheReported?: boolean;
  blurredVisionReported?: boolean;
  abdominalPainReported?: boolean;
  notes?: string;
  recommendations?: string;
  nextCheckDate?: string;
  // Follow-up scheduling
  scheduleFollowUp?: boolean;
  followUpDate?: string;
  followUpAssigneeId?: number;
  followUpNotes?: string;
  autoFollowUpEnabled?: boolean;
}

// Consultation
export interface Consultation {
  id: number;
  patient: Patient;
  doctor: User;
  type: ConsultationType;
  status: ConsultationStatus;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  videoRoomId?: string;
  videoRoomUrl?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  prescriptions?: string;
  advice?: string;
  referralRequired: boolean;
  referralDetails?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
}

export interface ConsultationRequest {
  patientId: number;
  doctorId: number;
  type: ConsultationType;
  scheduledAt: string;
  chiefComplaint?: string;
  notes?: string;
}

// Follow Up
export interface FollowUp {
  id: number;
  patient: Patient;
  assignedTo: User;
  scheduledDate: string;
  status: FollowUpStatus;
  callAttemptedAt?: string;
  callCompletedAt?: string;
  callDurationSeconds?: number;
  attemptCount: number;
  patientCondition?: string;
  symptomsReported?: string;
  medicationCompliance?: boolean;
  concernsRaised?: string;
  adviceGiven?: string;
  requiresDoctorConsultation: boolean;
  requiresImmediateAttention: boolean;
  notes?: string;
  nextFollowUpDate?: string;
  createdAt: string;
}

export interface FollowUpRequest {
  patientId: number;
  assignedToId: number;
  scheduledDate: string;
  notes?: string;
}

export interface FollowUpUpdateRequest {
  status: FollowUpStatus;
  callDurationSeconds?: number;
  patientCondition?: string;
  symptomsReported?: string;
  medicationCompliance?: boolean;
  concernsRaised?: string;
  adviceGiven?: string;
  requiresDoctorConsultation?: boolean;
  requiresImmediateAttention?: boolean;
  nextFollowUpDate?: string;
  notes?: string;
}

// Risk Alert
export interface RiskAlert {
  id: number;
  patient: Patient;
  healthCheck?: HealthCheck;
  alertType: AlertType;
  severity: RiskLevel;
  title: string;
  description: string;
  riskFactors?: string;
  recommendedAction?: string;
  isAcknowledged: boolean;
  acknowledgedBy?: User;
  acknowledgedAt?: string;
  acknowledgmentNotes?: string;
  actionTaken?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}

// Dashboard
export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  highRiskPatients: number;
  moderateRiskPatients: number;
  stablePatients: number;
  newRegistrationsToday: number;
  healthChecksToday: number;
  healthChecksThisMonth: number;
  consultationsToday: number;
  upcomingConsultations: number;
  followUpsToday: number;
  followUpsCompleted: number;
  overdueFollowUps: number;
  unacknowledgedAlerts: number;
  criticalAlerts: number;
  todaysAlerts: number;
  successfulDeliveries: number;
  motherMortality: number;
  babyMortality: number;
  activeDoctors: number;
  activeHelpDeskStaff: number;
}
