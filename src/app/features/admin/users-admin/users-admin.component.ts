import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-admin.component.html',
  styleUrl: './users-admin.component.scss'
})
export class UsersAdminComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  actionLoading = signal<number | null>(null);

  // Create user form
  showCreateForm = signal(false);
  newUsername = signal('');
  newPassword = signal('');
  newRole = signal<'ROLE_AGENT' | 'ROLE_ADMIN'>('ROLE_AGENT');
  createLoading = signal(false);
  createError = signal<string | null>(null);

  readonly roles: { value: 'ROLE_AGENT' | 'ROLE_ADMIN'; label: string }[] = [
    { value: 'ROLE_AGENT', label: 'Agent' },
    { value: 'ROLE_ADMIN', label: 'Administrateur' }
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les utilisateurs.');
        this.loading.set(false);
      }
    });
  }

  toggleUser(user: User): void {
    if (!user.id) return;
    this.actionLoading.set(user.id);
    this.api.toggleUser(user.id).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null)
    });
  }

  changeRole(user: User, role: string): void {
    if (!user.id) return;
    this.actionLoading.set(user.id);
    this.api.updateUserRole(user.id, role).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null)
    });
  }

  openCreateForm(): void {
    this.showCreateForm.set(true);
    this.newUsername.set('');
    this.newPassword.set('');
    this.newRole.set('ROLE_AGENT');
    this.createError.set(null);
  }

  closeCreateForm(): void {
    this.showCreateForm.set(false);
  }

  createUser(): void {
    if (!this.newUsername().trim() || !this.newPassword().trim()) {
      this.createError.set('Tous les champs sont requis.');
      return;
    }
    this.createLoading.set(true);
    this.createError.set(null);
    this.api.createUser({
      username: this.newUsername(),
      password: this.newPassword(),
      role: this.newRole()
    }).subscribe({
      next: (user) => {
        this.users.update(list => [user, ...list]);
        this.createLoading.set(false);
        this.showCreateForm.set(false);
      },
      error: (err) => {
        this.createLoading.set(false);
        this.createError.set(err.error?.message || 'Erreur lors de la création.');
      }
    });
  }

  getRoleLabel(role: string): string {
    return role === 'ROLE_ADMIN' ? 'Administrateur' : 'Agent';
  }
}
