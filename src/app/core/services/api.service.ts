import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FeedbackResponse, FeedbackFilter, PageResult,
  QrCode, Bus, Station
} from '../models/feedback.model';
import { User } from '../models/user.model';

/**
 * Point central des appels HTTP vers le backend Spring Boot.
 * Base URL : environment.apiUrl (ex. http://localhost:8080/api/v1/api/v1)
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Public Feedback ──────────────────────────────────────
  /** Soumission multipart : champs texte + métadonnées appareil + fichier photo optionnel. */
  submitFeedback(formData: FormData): Observable<FeedbackResponse> {
    return this.http.post<FeedbackResponse>(`${this.base}/complaints/public`, formData);
  }

  trackFeedback(reference: string, email?: string): Observable<FeedbackResponse> {
    let params = new HttpParams().set('reference', reference);
    if (email) {
      params = params.set('email', email);
    }
    return this.http.get<FeedbackResponse>(`${this.base}/complaints/public/follow`, { params });
  }

  getBuses(): Observable<Bus[]> {
    return this.http.get<Bus[]>(`${this.base}/public/buses`);
  }

  getStations(): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.base}/public/stations`);
  }

  // ── Agent / Admin Backoffice ──────────────────────────────
  getComplaints(filter: FeedbackFilter = {}): Observable<PageResult<FeedbackResponse>> {
    let params = new HttpParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<PageResult<FeedbackResponse>>(`${this.base}/agent/complaints`, { params });
  }

  getComplaintById(id: number): Observable<FeedbackResponse> {
    return this.http.get<FeedbackResponse>(`${this.base}/agent/complaints/${id}`);
  }

  updateComplaintStatus(id: number, status: string): Observable<FeedbackResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<FeedbackResponse>(`${this.base}/agent/complaints/${id}/status`, null, { params });
  }

  sendMessage(complaintId: number, content: string, isInternal = false): Observable<any> {
    return this.http.post(`${this.base}/agent/complaints/${complaintId}/messages`, { content, isInternal });
  }

  // ── Dashboard stats ───────────────────────────────────────
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.base}/agent/dashboard/kpis`);
  }

  // ── QR Codes management ───────────────────────────────────
  getQrCodes(): Observable<QrCode[]> {
    return this.http.get<QrCode[]>(`${this.base}/admin/qr-codes`);
  }

  generateQrCode(busId?: number, stationId?: number): Observable<QrCode> {
    let params = new HttpParams();
    if (busId) params = params.set('busId', String(busId));
    if (stationId) params = params.set('stationId', String(stationId));
    return this.http.post<QrCode>(`${this.base}/admin/qr-codes/generate`, null, { params });
  }

  deleteQrCode(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/admin/qr-codes/${id}`);
  }

  // ── User account management ───────────────────────────────
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/admin/users`);
  }

  createUser(userPayload: any): Observable<User> {
    return this.http.post<User>(`${this.base}/admin/users`, userPayload);
  }

  updateUserRole(id: number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.base}/admin/users/${id}/role`, { role });
  }

  toggleUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.base}/admin/users/${id}/toggle`, null);
  }
}
