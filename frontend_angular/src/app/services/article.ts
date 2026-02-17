import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Auth } from '../auth/auth'; // Importar el servicio de autenticación

// Interfaz para el objeto Artículo
export interface Article {
  id: number;
  title: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  author_id: number;
  editor_id: number | null;
  author: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  editor?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private backendUrl = 'http://localhost:8000';
  private http = inject(HttpClient);
  private authService = inject(Auth);

  // Método privado para obtener los headers de autenticación
  private getPrivateHeaders(): HttpHeaders | null {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      console.error('Token de autenticación no encontrado.');
      return null;
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // --- Métodos Públicos ---
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.backendUrl}/articles/`);
  }

  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.backendUrl}/articles/${id}`);
  }
  
  // --- Métodos de Dashboard (Protegidos) ---
  getArticlesForDashboard(): Observable<Article[]> {
    const headers = this.getPrivateHeaders();
    if (!headers) return of([]);
    
    const role = this.authService.getUserRole();
    let url = `${this.backendUrl}/articles/`;

    if (role === 'editor' || role === 'admin') {
      url = `${this.backendUrl}/articles/all/`;
    } else if (role === 'redactor') {
      url = `${this.backendUrl}/articles/?mine=true`;
    }

    return this.http.get<Article[]>(url, { headers });
  }

  createArticle(articleData: { title: string; content: string }): Observable<any> {
    const headers = this.getPrivateHeaders();
    if (!headers) return of({ error: 'No authentication token found.' });

    return this.http.post(`${this.backendUrl}/articles/`, articleData, { headers });
  }

  updateArticle(id: number, articleData: { title: string; content: string }): Observable<Article> {
    const headers = this.getPrivateHeaders();
    if (!headers) return of(); // Devuelve un observable vacío si no hay token
    
    return this.http.put<Article>(`${this.backendUrl}/articles/${id}`, articleData, { headers });
  }

  deleteArticle(id: number): Observable<any> {
    const headers = this.getPrivateHeaders();
    if (!headers) return of({ error: 'No authentication token found.' });

    return this.http.delete(`${this.backendUrl}/articles/${id}`, { headers });
  }

  updateArticleStatus(id: number, status: string): Observable<Article> {
    const headers = this.getPrivateHeaders();
    if (!headers) return of(); // Devuelve un observable vacío si no hay token

    const body = { status };
    return this.http.put<Article>(`${this.backendUrl}/articles/${id}/status`, body, { headers });
  }
}
