import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { FeedbackResponse, FeedbackFilter, FeedbackStatus, FeedbackType } from '../../../core/models/feedback.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { FeedbackStatusPipe } from '../../../shared/pipes/feedback-status.pipe';
import { FeedbackTypePipe } from '../../../shared/pipes/feedback-type.pipe';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StatusBadgeComponent, FeedbackStatusPipe, FeedbackTypePipe],
  templateUrl: './request-list.component.html',
  styleUrl: './request-list.component.scss'
})
export class RequestListComponent implements OnInit {
  complaints = signal<FeedbackResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);

  // Filters
  filterStatus = signal<FeedbackStatus | ''>('');
  filterType = signal<FeedbackType | ''>('');
  filterSearch = signal('');
  pageSize = 10;

  readonly statuses: { value: FeedbackStatus; label: string }[] = [
    { value: 'NOUVEAU', label: 'Nouveau' },
    { value: 'AFFECTE', label: 'Affecté' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'RESOLU', label: 'Résolu' },
    { value: 'CLOTURE', label: 'Clôturé' }
  ];

  readonly types: { value: FeedbackType; label: string }[] = [
    { value: 'RECLAMATION', label: 'Réclamation' },
    { value: 'INCIDENT', label: 'Incident' },
    { value: 'SUGGESTION', label: 'Suggestion' },
    { value: 'FELICITATIONS', label: 'Félicitations' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.loading.set(true);
    this.error.set(null);

    const filter: FeedbackFilter = {
      page: this.currentPage(),
      size: this.pageSize,
      sortBy: 'createdAt',
      direction: 'DESC'
    };

    if (this.filterStatus()) filter.status = this.filterStatus() as FeedbackStatus;
    if (this.filterType()) filter.type = this.filterType() as FeedbackType;
    if (this.filterSearch()) filter.search = this.filterSearch();

    this.api.getComplaints(filter).subscribe({
      next: (page) => {
        this.complaints.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les réclamations.');
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.currentPage.set(0);
    this.loadComplaints();
  }

  resetFilters(): void {
    this.filterStatus.set('');
    this.filterType.set('');
    this.filterSearch.set('');
    this.currentPage.set(0);
    this.loadComplaints();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.loadComplaints();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
