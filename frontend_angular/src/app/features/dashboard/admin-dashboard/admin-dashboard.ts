import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UserService } from '../../../core/services/user'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  private userService = inject(UserService);

  users: User[] = [];
  isLoading = true;
  error: string | null = null;
  
  // Estadísticas
  stats = {
    totalUsers: 0,
    admins: 0,
    editors: 0,
    redactors: 0,
    activeUsers: 0
  };
  
  // Roles disponibles para la asignación
  availableRoles: string[] = ['redactor', 'editor', 'admin'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;
    this.userService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching users:', err);
        this.error = 'No se pudo cargar la lista de usuarios.';
        this.isLoading = false;
      },
    });
  }

  calculateStats(): void {
    this.stats.totalUsers = this.users.length;
    this.stats.admins = this.users.filter(u => u.role === 'admin').length;
    this.stats.editors = this.users.filter(u => u.role === 'editor').length;
    this.stats.redactors = this.users.filter(u => u.role === 'redactor').length;
    this.stats.activeUsers = this.users.filter(u => u.is_active).length;
  }

  updateRole(userId: number, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newRole = selectElement.value;

    this.userService.updateUserRole(userId, newRole).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
      },
      error: (err) => {
        console.error(`Error updating role for user ${userId}:`, err);
        alert('No se pudo actualizar el rol del usuario.');
        selectElement.value = this.users.find(u => u.id === userId)?.role || '';
      }
    });
  }

  deleteUser(userId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
        },
        error: (err) => {
          console.error(`Error deleting user ${userId}:`, err);
          alert('No se pudo eliminar el usuario.');
        }
      });
    }
  }

  trackById(index: number, user: User): number {
    return user.id;
  }
}
