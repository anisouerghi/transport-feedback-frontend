/**
 * Types TypeScript alignés sur les DTOs backend (réclamations, bus, stations, QR).
 * FeedbackStatus / FeedbackType correspondent aux enums Java.
 */
export type FeedbackType = 'RECLAMATION' | 'SUGGESTION' | 'INCIDENT' | 'FELICITATIONS';
export type FeedbackStatus = 'NOUVEAU' | 'AFFECTE' | 'EN_COURS' | 'RESOLU' | 'CLOTURE';

export interface DeviceMetadata {
  uuid: string;
  os: string;
  browser: string;
  ipAddress?: string;
  latitude?: number;
  longitude?: number;
}

export interface FeedbackSubmission {
  type: FeedbackType;
  subject: string;
  description: string;
  travelerName?: string;
  travelerPhone?: string;
  travelerEmail?: string;
  busId?: number;
  stationId?: number;
}

export interface FeedbackResponse {
  id: number;
  reference: string;
  type: FeedbackType;
  status: FeedbackStatus;
  subject: string;
  description: string;
  travelerName?: string;
  travelerPhone?: string;
  travelerEmail?: string;
  deviceUuid: string;
  deviceOs: string;
  browser: string;
  ipAddress: string;
  latitude?: number;
  longitude?: number;
  busPlateNumber?: string;
  busModel?: string;
  lineCode?: string;
  lineName?: string;
  stationName?: string;
  assignedAgentName?: string;
  createdAt: string;
  resolvedAt?: string;
  attachmentFileName?: string;
  attachmentUrl?: string;
  attachmentSize?: number;
  messages?: FeedbackMessage[];
}

export interface FeedbackMessage {
  id: number;
  content: string;
  isInternal: boolean;
  senderName?: string;
  createdAt: string;
}

export interface FeedbackFilter {
  status?: FeedbackStatus;
  type?: FeedbackType;
  busId?: number;
  stationId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface QrCode {
  id: number;
  qrCodeIdentifier: string;
  targetUrl: string;
  bus?: Bus;
  station?: Station;
  generatedAt: string;
}

export interface Bus {
  id: number;
  plateNumber: string;
  model?: string;
  line: Line;
  active: boolean;
}

export interface Line {
  id: number;
  code: string;
  name: string;
  type: string;
  active: boolean;
}

export interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  active: boolean;
}
