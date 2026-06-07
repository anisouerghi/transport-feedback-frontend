import { Pipe, PipeTransform } from '@angular/core';
import { FeedbackStatus } from '../../core/models/feedback.model';

@Pipe({
  name: 'feedbackStatus',
  standalone: true
})
export class FeedbackStatusPipe implements PipeTransform {
  transform(value: FeedbackStatus | string | undefined | null): string {
    if (!value) return '-';
    switch (value) {
      case 'NOUVEAU': return 'Nouveau';
      case 'AFFECTE': return 'Assigné';
      case 'EN_COURS': return 'En cours';
      case 'RESOLU': return 'Résolu';
      case 'CLOTURE': return 'Clôturé';
      default: return value;
    }
  }
}
