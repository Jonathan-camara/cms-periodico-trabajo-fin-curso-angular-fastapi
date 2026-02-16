import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UserService } from '../../services/user'; // Asegúrate de que la ruta sea correcta

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
  
  // Roles disponibles para la asignación
  availableRoles: string[] = ['redactor', 'editor', 'admin'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.error = 'No se pudo cargar la lista de usuarios.';
        this.isLoading = false;
      },
    });
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
        // Opcional: recargar la lista para revertir el cambio en el select
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
