import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../auth/auth';
import { Router, RouterModule } from '@angular/router'; // Importar Router

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit { // Implementar OnInit
  private authService = inject(Auth); // Renombrar para evitar conflicto con la clase Auth
  private router = inject(Router);

  ngOnInit(): void {
    const userRole = this.authService.getUserRole();
    if (userRole) {
      switch (userRole) {
        case 'redactor':
          this.router.navigate(['/dashboard/redactor-dashboard']);
          break;
        case 'editor':
          this.router.navigate(['/dashboard/editor-dashboard']);
          break;
        case 'admin':
          this.router.navigate(['/dashboard/admin-dashboard']);
          break;
        default:
          // Redirigir a una página de acceso denegado o al login si el rol no es reconocido
          this.router.navigate(['/login']);
          break;
      }
    } else {
      // Si no hay rol o usuario logueado, redirigir al login
      this.router.navigate(['/login']);
    }
  }
}
