import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'feedback',
    pathMatch: 'full'
  },
  {
    path: 'feedback',
    loadComponent: () => import('./features/public/form-page/form-page.component').then(m => m.FormPageComponent)
  },
  {
    path: 'form',
    loadComponent: () => import('./features/public/form-page/form-page.component').then(m => m.FormPageComponent)
  },
  {
    path: 'track',
    loadComponent: () => import('./features/public/track-page/track-page.component').then(m => m.TrackPageComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page/login-page.component').then(m => m.LoginPageComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'complaints',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/agent/request-list/request-list.component').then(m => m.RequestListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/agent/request-detail/request-detail.component').then(m => m.RequestDetailComponent)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_ADMIN'] },
    children: [
      {
        path: 'qrcodes',
        loadComponent: () => import('./features/admin/qrcodes-admin/qrcodes-admin.component').then(m => m.QrcodesAdminComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users-admin/users-admin.component').then(m => m.UsersAdminComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'feedback'
  }
];
