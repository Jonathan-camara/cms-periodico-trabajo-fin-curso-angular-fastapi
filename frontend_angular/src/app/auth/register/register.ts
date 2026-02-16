import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  userData = {
    username: '',
    email: '',
    password: '',
    role: 'lector' // Rol por defecto
  };

  auth = inject(Auth);
  router = inject(Router);
  registrationError: string | null = null;

  register() {
    this.registrationError = null;
    this.auth.register(this.userData).subscribe({
      next: () => {
        // Redirigir a la página de login tras un registro exitoso
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error en el registro:', err);
        // El backend envía el detalle del error en err.error.detail
        this.registrationError = err.error?.detail || 'Ha ocurrido un error inesperado.';
      }
    });
  }
}
