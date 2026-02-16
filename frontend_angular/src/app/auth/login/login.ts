import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  credentials = {
    email: '',
    password: ''
  };

  auth = inject(Auth);
  router = inject(Router);
  loginError = false;

  login() {
    this.loginError = false;
    this.auth.login(this.credentials).subscribe({
      next: () => {
        // Redirigir al dashboard o a la página principal tras un login exitoso
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.loginError = true;
      }
    });
  }
}
