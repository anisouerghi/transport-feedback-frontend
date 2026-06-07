import { Injectable } from '@angular/core';

import { DeviceMetadata } from '../models/feedback.model';

const UUID_KEY = 'tf_device_uuid';

/**
 * Collecte les métadonnées envoyées avec chaque signalement public :
 * UUID persistant, OS, navigateur, IP (ipify), GPS optionnel (5 s timeout).
 */
@Injectable({ providedIn: 'root' })
export class DeviceMetadataService {

  /** Identifiant anonyme de l'appareil, conservé entre les sessions (localStorage). */
  getOrCreateUuid(): string {
    let id = localStorage.getItem(UUID_KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem(UUID_KEY, id);
    }
    return id;
  }

  detectOs(): string {
    const ua = navigator.userAgent;
    if (/Windows/.test(ua))  return 'Windows';
    if (/Android/.test(ua))  return 'Android';
    if (/iPhone|iPad/.test(ua)) return 'iOS';
    if (/Mac/.test(ua))      return 'macOS';
    if (/Linux/.test(ua))    return 'Linux';
    return 'Unknown';
  }

  detectBrowser(): string {
    const ua = navigator.userAgent;
    if (/Edg\//.test(ua))    return 'Edge';
    if (/OPR\//.test(ua))    return 'Opera';
    if (/Chrome/.test(ua))   return 'Chrome';
    if (/Firefox/.test(ua))  return 'Firefox';
    if (/Safari/.test(ua))   return 'Safari';
    return 'Unknown';
  }

  async collectMetadata(): Promise<DeviceMetadata> {
    const base: DeviceMetadata = {
      uuid: this.getOrCreateUuid(),
      os: this.detectOs(),
      browser: this.detectBrowser(),
    };

    // GPS : optionnel — échec silencieux si refus ou timeout navigateur
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      base.latitude  = pos.coords.latitude;
      base.longitude = pos.coords.longitude;
    } catch {
      // La géolocalisation est optionnelle
    }

    // IP via service public (fallback gracieux)
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      base.ipAddress = data.ip;
    } catch {
      base.ipAddress = 'Unknown';
    }

    return base;
  }
}
