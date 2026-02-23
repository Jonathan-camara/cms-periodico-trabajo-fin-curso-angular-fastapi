import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';

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
    role: 'lector' // Rol por defecto: Lector
  };

  auth = inject(Auth);
  router = inject(Router);
  registrationError: string | null = null;

  register() {
    this.registrationError = null;
    
    // Validación básica antes de enviar
    if (!this.userData.email.includes('@')) {
      this.registrationError = 'Por favor, introduce un email válido.';
      return;
    }

    this.auth.register(this.userData).subscribe({
      next: () => {
        alert('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Detalle del error:', err);
        // Si el backend envía un detalle, lo mostramos. Si no, error genérico.
        if (err.status === 400 && err.error?.detail) {
          this.registrationError = err.error.detail;
        } else if (err.status === 422) {
          this.registrationError = 'Datos inválidos. Revisa el formato del email o la contraseña.';
        } else {
          this.registrationError = 'Error al conectar con el servidor. Inténtalo de nuevo.';
        }
      }
    });
  }
}
