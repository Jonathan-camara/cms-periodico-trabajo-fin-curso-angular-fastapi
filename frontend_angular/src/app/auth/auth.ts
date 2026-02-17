import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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
  private backendUrl = 'http://localhost:8000';
  private decodedToken = signal<DecodedToken | null>(null);

  constructor(private http: HttpClient) {
    // Al inicializar el servicio, intenta cargar el token desde localStorage
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
            this.setToken(response.access_token);
          }
        })
      );
  }

  logout(): void {
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
    }
  }

  isLoggedIn(): boolean {
    const token = this.decodedToken();
    if (!token) return false;
    // Verifica si el token ha expirado (exp se mide en segundos)
    const isExpired = token.exp * 1000 < Date.now();
    if (isExpired) {
      // this.logout(); // ELIMINADO: Llamar a logout() aquí causa un error NG0600 porque modifica una señal durante el renderizado.
      return false;
    }
    return true;
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
