import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if ([401, 403].includes(error.status) && authService.isLoggedIn()) {
        // Auto-logout when unauthorized/forbidden (excluding login requests)
        if (!req.url.includes('/auth/login')) {
          authService.logout();
        }
      }

      return throwError(() => error);
    })
  );
};
