import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

// Esta interfaz se puede expandir o mover a un archivo de modelos compartido
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private backendUrl = 'http://localhost:8000';
  private http = inject(HttpClient);

  private getPrivateHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      // En un caso real, manejaríamos este error de forma más elegante
      throw new Error('Token de autenticación no encontrado.');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getUsers(): Observable<User[]> {
    const headers = this.getPrivateHeaders();
    return this.http.get<User[]>(`${this.backendUrl}/users/`, { headers });
  }

  updateUserRole(userId: number, role: string): Observable<User> {
    const headers = this.getPrivateHeaders();
    const body = { role };
    return this.http.put<User>(`${this.backendUrl}/users/${userId}/role`, body, { headers });
  }

  deleteUser(userId: number): Observable<any> {
    const headers = this.getPrivateHeaders();
    return this.http.delete(`${this.backendUrl}/users/${userId}`, { headers });
  }
}
