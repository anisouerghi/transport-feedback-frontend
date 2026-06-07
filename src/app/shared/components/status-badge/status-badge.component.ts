import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackStatusPipe } from '../../pipes/feedback-status.pipe';
import { FeedbackTypePipe } from '../../pipes/feedback-type.pipe';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, FeedbackStatusPipe, FeedbackTypePipe],
  template: `
    <span class="badge" [ngClass]="getBadgeClass()">
      @if (badgeType === 'status') {
        {{ value | feedbackStatus }}
      } @else if (badgeType === 'type') {
        {{ value | feedbackType }}
      } @else {
        {{ value }}
      }
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    // Status colors
    .badge-pending {
      background-color: var(--warning-light);
      color: var(--warning);
    }
    .badge-in-progress {
      background-color: var(--info-light);
      color: var(--info);
    }
    .badge-resolved {
      background-color: var(--success-light);
      color: var(--success);
    }
    .badge-closed {
      background-color: #f1f5f9;
      color: #64748b;
    }
    :host-context(.dark-theme) .badge-closed {
      background-color: #334155;
      color: #94a3b8;
    }
    .badge-rejected {
      background-color: var(--danger-light);
      color: var(--danger);
    }
    
    // Type colors
    .badge-complaint {
      background-color: var(--danger-light);
      color: var(--danger);
    }
    .badge-suggestion {
      background-color: var(--primary-light);
      color: var(--primary);
    }
    .badge-compliment {
      background-color: var(--success-light);
      color: var(--success);
    }

    // Priority colors
    .badge-low {
      background-color: #e2e8f0;
      color: #475569;
    }
    .badge-medium {
      background-color: var(--info-light);
      color: var(--info);
    }
    .badge-high {
      background-color: var(--warning-light);
      color: var(--warning);
    }
    .badge-urgent {
      background-color: var(--danger-light);
      color: var(--danger);
    }
  `]
})
export class StatusBadgeComponent {
  @Input() value!: string;
  @Input() badgeType: 'status' | 'type' | 'priority' = 'status';

  getBadgeClass(): string {
    const val = this.value?.toLowerCase() || '';
    if (this.badgeType === 'status') {
      return `badge-${val.replace('_', '-')}`;
    }
    return `badge-${val}`;
  }
}
