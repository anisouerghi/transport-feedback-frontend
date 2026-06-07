import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { FeedbackStatusPipe } from '../../../shared/pipes/feedback-status.pipe';
import { FeedbackTypePipe } from '../../../shared/pipes/feedback-type.pipe';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FeedbackStatusPipe, FeedbackTypePipe, StatusBadgeComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent implements OnInit {
  stats = signal<any>(null);
  recentComplaints = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly statCards = signal<{ label: string; key: string; icon: string; color: string }[]>([
    { label: 'Nouvelles réclamations', key: 'totalNew',     icon: '🔵', color: 'primary' },
    { label: 'En cours de traitement', key: 'totalInProgress', icon: '🟠', color: 'warning' },
    { label: 'Résolues ce mois',       key: 'totalResolved', icon: '🟢', color: 'success' },
    { label: 'Clôturées',              key: 'totalClosed',   icon: '⚫', color: 'muted' }
  ]);

  constructor(
    private api: ApiService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    // Load recent complaints for quick view
    this.api.getComplaints({ page: 0, size: 5, sortBy: 'createdAt', direction: 'DESC' }).subscribe({
      next: (page) => {
        this.recentComplaints.set(page.content);
        // Build stats from the page result (fallback if dedicated endpoint is unavailable)
        this.stats.set({
          totalNew: page.content.filter(c => c.status === 'NOUVEAU').length,
          totalInProgress: page.content.filter(c => c.status === 'EN_COURS' || c.status === 'AFFECTE').length,
          totalResolved: page.content.filter(c => c.status === 'RESOLU').length,
          totalClosed: page.content.filter(c => c.status === 'CLOTURE').length,
          total: page.totalElements
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le tableau de bord.');
        this.loading.set(false);
      }
    });

    // Try dedicated KPI endpoint as well
    this.api.getDashboardStats().subscribe({
      next: (data) => this.stats.set(data),
      error: () => { /* silently ignore if not available */ }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  getStatValue(key: string): number {
    return this.stats()?.[key] ?? 0;
  }
}
