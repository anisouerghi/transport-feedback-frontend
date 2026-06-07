import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Vérifie le rôle utilisateur (ex. ROLE_ADMIN pour /admin/*).
 * Utilise route.data.roles défini dans app.routes.ts.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data?.['roles'] as string[];

  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  if (authService.isLoggedIn()) {
    const hasRole = expectedRoles.some(role => authService.hasRole(role));
    if (hasRole) {
      return true;
    }
  }

  router.navigate(['/dashboard']);
  return false;
};
