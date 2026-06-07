import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { FeedbackResponse } from '../../../core/models/feedback.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-track-page',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, StatusBadgeComponent],
  templateUrl: './track-page.component.html',
  styleUrl: './track-page.component.scss'
})
export class TrackPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  referenceInput = signal('');
  emailInput = signal('');
  
  isLoading = signal(false);
  searched = signal(false);
  errorMessage = signal<string | null>(null);

  complaint = signal<FeedbackResponse | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const ref = params['reference'];
      if (ref) {
        this.referenceInput.set(ref);
        this.search(ref);
      }
    });
  }

  onSearchSubmit() {
    if (!this.referenceInput().trim()) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { reference: this.referenceInput() },
      queryParamsHandling: 'merge'
    });
    this.search(this.referenceInput());
  }

  private search(reference: string) {
    this.isLoading.set(true);
    this.searched.set(true);
    this.errorMessage.set(null);
    this.complaint.set(null);

    this.apiService.trackFeedback(reference, this.emailInput() || undefined).subscribe({
      next: (data) => {
        this.complaint.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Réclamation non trouvée. Veuillez vérifier le numéro de référence.');
        this.isLoading.set(false);
      }
    });
  }

  getStepStatus(step: string): 'completed' | 'active' | 'pending' {
    const complaintData = this.complaint();
    if (!complaintData) return 'pending';

    const currentStatus = complaintData.status;
    const stepsOrder = ['NOUVEAU', 'AFFECTE', 'EN_COURS', 'RESOLU', 'CLOTURE'];
    const currentIndex = stepsOrder.indexOf(currentStatus);
    const stepIndex = stepsOrder.indexOf(step);

    if (stepIndex < currentIndex) {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'active';
    } else {
      return 'pending';
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
