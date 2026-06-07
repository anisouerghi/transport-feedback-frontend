import { Pipe, PipeTransform } from '@angular/core';
import { FeedbackType } from '../../core/models/feedback.model';

@Pipe({
  name: 'feedbackType',
  standalone: true
})
export class FeedbackTypePipe implements PipeTransform {
  transform(value: FeedbackType | string | undefined | null): string {
    if (!value) return '-';
    switch (value) {
      case 'RECLAMATION': return 'Réclamation';
      case 'SUGGESTION': return 'Suggestion';
      case 'INCIDENT': return 'Incident';
      case 'FELICITATIONS': return 'Félicitations';
      default: return value;
    }
  }
}
