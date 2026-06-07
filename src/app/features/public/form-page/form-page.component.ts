import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { DeviceMetadataService } from '../../../core/services/device-metadata.service';
import { FeedbackType, Bus, Station } from '../../../core/models/feedback.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './form-page.component.html',
  styleUrl: './form-page.component.scss'
})
export class FormPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private metadataService = inject(DeviceMetadataService);

  feedbackForm!: FormGroup;
  isSubmitting = signal(false);
  isLoadingRefs = signal(true);
  submitSuccess = signal(false);
  createdReference = signal<string | null>(null);

  // Reference lists for manual selection
  buses = signal<Bus[]>([]);
  stations = signal<Station[]>([]);
  
  // Selection mode: 'bus' | 'station' | 'none'
  contextMode = signal<'bus' | 'station' | 'none'>('none');
  
  // Selected Context (loaded if id present in url)
  selectedBus = signal<Bus | null>(null);
  selectedStation = signal<Station | null>(null);

  selectedFile: File | null = null;
  filePreview: string | null = null;

  ngOnInit() {
    this.initForm();
    this.loadQueryParamsAndRefs();
  }

  private initForm() {
    this.feedbackForm = this.fb.group({
      type: ['RECLAMATION', Validators.required],
      subject: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', Validators.required],
      busId: [null],
      stationId: [null],
      travelerName: [''],
      travelerPhone: [''],
      travelerEmail: ['', Validators.email]
    });
  }

  private async loadQueryParamsAndRefs() {
    try {
      // Parallel loading of buses and stations reference lists
      this.apiService.getBuses().subscribe(data => this.buses.set(data));
      this.apiService.getStations().subscribe(data => this.stations.set(data));

      this.route.queryParams.subscribe(params => {
        const busIdParam = params['busId'];
        const stationIdParam = params['stationId'];

        if (busIdParam) {
          const id = Number(busIdParam);
          this.feedbackForm.patchValue({ busId: id });
          this.contextMode.set('bus');
          // Fetch selected bus details
          this.apiService.getBuses().subscribe(buses => {
            const match = buses.find(b => b.id === id);
            if (match) this.selectedBus.set(match);
          });
        } else if (stationIdParam) {
          const id = Number(stationIdParam);
          this.feedbackForm.patchValue({ stationId: id });
          this.contextMode.set('station');
          // Fetch selected station details
          this.apiService.getStations().subscribe(stations => {
            const match = stations.find(s => s.id === id);
            if (match) this.selectedStation.set(match);
          });
        }
        this.isLoadingRefs.set(false);
      });
    } catch (e) {
      console.error(e);
      this.isLoadingRefs.set(false);
    }
  }

  selectType(type: FeedbackType) {
    this.feedbackForm.patchValue({ type });
  }

  setContextMode(mode: 'bus' | 'station' | 'none') {
    this.contextMode.set(mode);
    if (mode !== 'bus') {
      this.feedbackForm.patchValue({ busId: null });
      this.selectedBus.set(null);
    }
    if (mode !== 'station') {
      this.feedbackForm.patchValue({ stationId: null });
      this.selectedStation.set(null);
    }
  }

  onBusChange(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    const bus = this.buses().find(b => b.id === id) || null;
    this.selectedBus.set(bus);
  }

  onStationChange(event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    const station = this.stations().find(s => s.id === id) || null;
    this.selectedStation.set(station);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Generate preview if it's an image
      if (this.selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.filePreview = reader.result as string;
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        this.filePreview = null;
      }
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.filePreview = null;
  }

  async onSubmit() {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const metadata = await this.metadataService.collectMetadata();

      const formData = new FormData();
      formData.append('type', this.feedbackForm.value.type);
      formData.append('subject', this.feedbackForm.value.subject);
      formData.append('description', this.feedbackForm.value.description);
      
      if (this.feedbackForm.value.busId) {
        formData.append('busId', String(this.feedbackForm.value.busId));
      }
      if (this.feedbackForm.value.stationId) {
        formData.append('stationId', String(this.feedbackForm.value.stationId));
      }

      formData.append('travelerName', this.feedbackForm.value.travelerName || '');
      formData.append('travelerPhone', this.feedbackForm.value.travelerPhone || '');
      formData.append('travelerEmail', this.feedbackForm.value.travelerEmail || '');

      formData.append('deviceUuid', metadata.uuid);
      formData.append('deviceOs', metadata.os);
      formData.append('browser', metadata.browser);
      formData.append('ipAddress', metadata.ipAddress || '127.0.0.1');

      if (metadata.latitude) formData.append('latitude', String(metadata.latitude));
      if (metadata.longitude) formData.append('longitude', String(metadata.longitude));

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      this.apiService.submitFeedback(formData).subscribe({
        next: (response) => {
          this.createdReference.set(response.reference);
          this.submitSuccess.set(true);
          this.isSubmitting.set(false);
          this.feedbackForm.reset();
          this.removeFile();
        },
        error: (err) => {
          console.error(err);
          alert("Une erreur est survenue lors de la soumission de votre signalement.");
          this.isSubmitting.set(false);
        }
      });

    } catch (e) {
      console.error(e);
      alert("Une erreur est survenue lors de la récupération des métadonnées de l'appareil.");
      this.isSubmitting.set(false);
    }
  }

  copyReference() {
    if (this.createdReference()) {
      navigator.clipboard.writeText(this.createdReference()!);
      alert('Numéro de suivi copié !');
    }
  }

  resetSuccess() {
    this.submitSuccess.set(false);
    this.createdReference.set(null);
    this.contextMode.set('none');
    this.selectedBus.set(null);
    this.selectedStation.set(null);
    this.initForm();
  }
}
