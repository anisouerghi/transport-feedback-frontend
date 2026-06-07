import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthRequest, AuthResponse, User, UserRole } from '../models/user.model';

const TOKEN_KEY = 'tf_access_token';
const USER_KEY  = 'tf_user';

/**
 * Gestion de la session agent/admin : login, JWT en localStorage, rôles.
 * Le token est injecté automatiquement par authInterceptor sur chaque requête HTTP.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;

  private _currentUser = signal<User | null>(this.loadUser());
  private _token        = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly currentUser  = this._currentUser.asReadonly();
  readonly isLoggedIn   = computed(() => !!this._token());
  readonly isAdmin      = computed(() => this._currentUser()?.role === 'ROLE_ADMIN');
  /** Admin hérite des droits agent (isAgent inclut ROLE_ADMIN). */
  readonly isAgent      = computed(() => this._currentUser()?.role === 'ROLE_AGENT' || this._currentUser()?.role === 'ROLE_ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: AuthRequest) {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, credentials).pipe(
      tap(resp => {
        const user: User = {
          username: resp.username,
          role: resp.role
        };
        localStorage.setItem(TOKEN_KEY, resp.token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._token.set(resp.token);
        this._currentUser.set(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  hasRole(role: UserRole | string): boolean {
    return this._currentUser()?.role === role;
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
