import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { FeedbackResponse, FeedbackStatus } from '../../../core/models/feedback.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { FeedbackStatusPipe } from '../../../shared/pipes/feedback-status.pipe';
import { FeedbackTypePipe } from '../../../shared/pipes/feedback-type.pipe';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatusBadgeComponent, FeedbackStatusPipe, FeedbackTypePipe],
  templateUrl: './request-detail.component.html',
  styleUrl: './request-detail.component.scss'
})
export class RequestDetailComponent implements OnInit {
  complaint = signal<FeedbackResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  statusLoading = signal(false);
  messageLoading = signal(false);
  messageSent = signal(false);

  newMessage = signal('');
  isInternal = signal(false);
  selectedStatus = signal<FeedbackStatus | ''>('');

  readonly statuses: { value: FeedbackStatus; label: string; icon: string }[] = [
    { value: 'NOUVEAU',   label: 'Nouveau',   icon: '🔵' },
    { value: 'AFFECTE',   label: 'Affecté',   icon: '🟡' },
    { value: 'EN_COURS',  label: 'En cours',  icon: '🟠' },
    { value: 'RESOLU',    label: 'Résolu',    icon: '🟢' },
    { value: 'CLOTURE',   label: 'Clôturé',   icon: '⚫' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadComplaint(id);
  }

  loadComplaint(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getComplaintById(id).subscribe({
      next: (c) => {
        this.complaint.set(c);
        this.selectedStatus.set(c.status);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger la réclamation.');
        this.loading.set(false);
      }
    });
  }

  updateStatus(): void {
    const c = this.complaint();
    const status = this.selectedStatus();
    if (!c || !status || status === c.status) return;
    this.statusLoading.set(true);
    this.api.updateComplaintStatus(c.id, status).subscribe({
      next: (updated) => {
        this.complaint.set(updated);
        this.selectedStatus.set(updated.status);
        this.statusLoading.set(false);
      },
      error: () => {
        this.statusLoading.set(false);
      }
    });
  }

  sendMessage(): void {
    const c = this.complaint();
    const content = this.newMessage().trim();
    if (!c || !content) return;
    this.messageLoading.set(true);
    this.api.sendMessage(c.id, content, this.isInternal()).subscribe({
      next: () => {
        this.messageLoading.set(false);
        this.newMessage.set('');
        this.messageSent.set(true);
        setTimeout(() => this.messageSent.set(false), 3000);
        this.loadComplaint(c.id);
      },
      error: () => {
        this.messageLoading.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatShortDate(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/complaints']);
  }
}
