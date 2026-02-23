import { Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  auth = inject(Auth);
  router = inject(Router);

  isLoggedIn: Signal<boolean>;
  today: Date = new Date(); // Fecha de hoy


  constructor() {
    this.isLoggedIn = this.auth.isLoggedIn;
  }

  get username(): string | null {
    return this.auth.getUsername();
  }

  search(term: string): void {
    if (term.trim()) {
      console.log('Buscando:', term);
      this.router.navigate(['/articulos'], { queryParams: { q: term } });
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
