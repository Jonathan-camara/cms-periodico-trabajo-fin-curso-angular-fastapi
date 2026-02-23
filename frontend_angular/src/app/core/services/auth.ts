import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string; // Subject (username)
  user_id: number; // Añadido user_id
  role: string;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private backendUrl = 'http://localhost:8000/api/v1';
  
  // La señal base que contiene el token decodificado
  private decodedToken: WritableSignal<DecodedToken | null> = signal(null);

  // --- START: Lógica de estado reactivo con Signals ---
  // Señal pública y computada que reacciona a los cambios en 'decodedToken'
  public isLoggedIn: Signal<boolean> = computed(() => {
    const token = this.decodedToken();
    if (!token) return false;
    const isExpired = token.exp * 1000 < Date.now();
    return !isExpired;
  });
  // --- END: Lógica de estado reactivo con Signals ---

  constructor(private http: HttpClient) {
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.setToken(token);
      }
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.backendUrl}/auth/register`, userData);
  }

  login(credentials: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new URLSearchParams();
    body.set('username', credentials.email);
    body.set('password', credentials.password);

    return this.http.post(`${this.backendUrl}/auth/token`, body.toString(), { headers })
      .pipe(
        tap((response: any) => {
          if (response.access_token) {
            // Al llamar a setToken, la señal 'decodedToken' se actualiza,
            // y la señal computada 'isLoggedIn' reaccionará automáticamente.
            this.setToken(response.access_token);
          }
        })
      );
  }

  logout(): void {
    // Al poner la señal a null, 'isLoggedIn' reaccionará automáticamente.
    this.decodedToken.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private setToken(token: string): void {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      this.decodedToken.set(decoded);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_token', token);
      }
    } catch (error) {
      console.error("Error decoding token", error);
      this.decodedToken.set(null);
      // Al fallar el decode, el token es inválido y debe ser eliminado.
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
  }
  
  getUsername(): string | null {
    return this.decodedToken()?.sub || null;
  }

  getUserRole(): string | null {
    return this.decodedToken()?.role || null;
  }

  getUserId(): number | null {
    return this.decodedToken()?.user_id || null;
  }
}
