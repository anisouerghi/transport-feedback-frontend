import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { QrCode, Bus, Station } from '../../../core/models/feedback.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-qrcodes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './qrcodes-admin.component.html',
  styleUrl: './qrcodes-admin.component.scss'
})
export class QrcodesAdminComponent implements OnInit {
  qrCodes = signal<QrCode[]>([]);
  buses = signal<Bus[]>([]);
  stations = signal<Station[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Generate form
  showGenerateForm = signal(false);
  generateType = signal<'bus' | 'station'>('bus');
  selectedBusId = signal<number | null>(null);
  selectedStationId = signal<number | null>(null);
  generateLoading = signal(false);
  generateError = signal<string | null>(null);

  // Delete dialog
  deleteTarget = signal<QrCode | null>(null);
  showDeleteDialog = signal(false);
  deleteLoading = signal(false);

  // Search / filter
  searchQuery = signal('');

  private apiBase = environment.apiUrl;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load QR codes, buses, and stations in parallel
    this.api.getQrCodes().subscribe({
      next: (codes) => {
        this.qrCodes.set(codes);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les QR codes.');
        this.loading.set(false);
      }
    });

    this.api.getBuses().subscribe({
      next: (buses) => this.buses.set(buses),
      error: () => {}
    });

    this.api.getStations().subscribe({
      next: (stations) => this.stations.set(stations),
      error: () => {}
    });
  }

  get filteredQrCodes(): QrCode[] {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.qrCodes();
    return this.qrCodes().filter(qr =>
      qr.qrCodeIdentifier.toLowerCase().includes(query) ||
      qr.targetUrl.toLowerCase().includes(query) ||
      (qr.bus?.plateNumber?.toLowerCase().includes(query)) ||
      (qr.station?.name?.toLowerCase().includes(query))
    );
  }

  // ── Generate ────────────────────────────────────────────────
  openGenerateForm(): void {
    this.showGenerateForm.set(true);
    this.generateType.set('bus');
    this.selectedBusId.set(null);
    this.selectedStationId.set(null);
    this.generateError.set(null);
  }

  closeGenerateForm(): void {
    this.showGenerateForm.set(false);
  }

  generateQrCode(): void {
    const busId = this.generateType() === 'bus' ? this.selectedBusId() ?? undefined : undefined;
    const stationId = this.generateType() === 'station' ? this.selectedStationId() ?? undefined : undefined;

    if (!busId && !stationId) {
      this.generateError.set('Veuillez sélectionner un bus ou une station.');
      return;
    }

    this.generateLoading.set(true);
    this.generateError.set(null);

    this.api.generateQrCode(busId, stationId).subscribe({
      next: (qr) => {
        this.qrCodes.update(list => [qr, ...list]);
        this.generateLoading.set(false);
        this.showGenerateForm.set(false);
      },
      error: (err) => {
        this.generateLoading.set(false);
        this.generateError.set(err.error?.message || 'Erreur lors de la génération.');
      }
    });
  }

  // ── Delete ──────────────────────────────────────────────────
  askDelete(qr: QrCode): void {
    this.deleteTarget.set(qr);
    this.showDeleteDialog.set(true);
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const qr = this.deleteTarget();
    if (!qr) return;
    this.deleteLoading.set(true);
    this.api.deleteQrCode(qr.id).subscribe({
      next: () => {
        this.qrCodes.update(list => list.filter(q => q.id !== qr.id));
        this.deleteLoading.set(false);
        this.showDeleteDialog.set(false);
        this.deleteTarget.set(null);
      },
      error: () => {
        this.deleteLoading.set(false);
        this.showDeleteDialog.set(false);
      }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────
  getQrImageUrl(identifier: string): string {
    return `${this.apiBase}/complaints/public/qr-codes/${identifier}/image`;
  }

  downloadPdf(qr: QrCode): void {
    window.open(`${this.apiBase}/admin/qr-codes/${qr.id}/pdf`, '_blank');
  }

  getLocationLabel(qr: QrCode): string {
    if (qr.bus) {
      return `Bus ${qr.bus.plateNumber}${qr.bus.line ? ' — ' + qr.bus.line.name : ''}`;
    }
    if (qr.station) {
      return `Station ${qr.station.name}`;
    }
    return 'Non attribué';
  }

  getLocationIcon(qr: QrCode): string {
    if (qr.bus) return '🚌';
    if (qr.station) return '🚉';
    return '📍';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
