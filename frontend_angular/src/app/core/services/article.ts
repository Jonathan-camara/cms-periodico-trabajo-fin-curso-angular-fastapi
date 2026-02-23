import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Auth } from './auth'; // Importar el servicio de autenticación

// Interfaz para el objeto Artículo
export interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  status: string;
  editor_feedback?: string; // Nuevo campo
  created_at: string;
  updated_at: string | null;
  author_id: number;
  editor_id: number | null;
  image_filename?: string | null;
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
  private backendUrl = 'http://localhost:8000/api/v1';
  private http = inject(HttpClient);
  private authService = inject(Auth);

  // Método privado para obtener los headers de autenticación
  private getPrivateHeaders(isFormData: boolean = false): HttpHeaders | null {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      // No loguear error aquí, es normal para visitantes públicos
      return null;
    }
    
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }
    
    return headers;
  }

  // --- Métodos Públicos ---
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.backendUrl}/articles/`);
  }

  getArticleById(id: number): Observable<Article> {
    const headers = this.getPrivateHeaders();
    if (headers) {
      return this.http.get<Article>(`${this.backendUrl}/articles/${id}`, { headers });
    }
    // Si no hay headers, intentar de todos modos (el backend decidirá si dar 403 o no)
    return this.http.get<Article>(`${this.backendUrl}/articles/${id}`);
  }

  getArticleImageUrl(id: number): string {
    return `${this.backendUrl}/articles/${id}/image`;
  }
  
  // --- Métodos de Dashboard (Protegidos) ---
  getArticlesForDashboard(): Observable<Article[]> {
    const headers = this.getPrivateHeaders();
    
    // Si no hay headers (usuario no logueado), usar endpoint público
    if (!headers) {
      return this.http.get<Article[]>(`${this.backendUrl}/articles/`);
    }
    
    const role = this.authService.getUserRole();
    let url = `${this.backendUrl}/articles/`;

    if (role === 'editor' || role === 'admin') {
      url = `${this.backendUrl}/articles/all/`;
    } else if (role === 'redactor') {
      url = `${this.backendUrl}/articles/?mine=true`;
    }

    return this.http.get<Article[]>(url, { headers });
  }

  createArticle(formData: FormData): Observable<any> {
    const headers = this.getPrivateHeaders(true);
    if (!headers) return throwError(() => new Error('Token de autenticación no encontrado. Inicia sesión de nuevo.'));

    return this.http.post(`${this.backendUrl}/articles/`, formData, { headers });
  }

  updateArticle(id: number, articleData: any): Observable<Article> {
    const isFormData = articleData instanceof FormData;
    const headers = this.getPrivateHeaders(isFormData);
    if (!headers) return throwError(() => new Error('Token de autenticación no encontrado. Inicia sesión de nuevo.'));
    
    return this.http.put<Article>(`${this.backendUrl}/articles/${id}`, articleData, { headers });
  }

  deleteArticle(id: number): Observable<any> {
    const headers = this.getPrivateHeaders();
    if (!headers) return throwError(() => new Error('Token de autenticación no encontrado. Inicia sesión de nuevo.'));

    return this.http.delete(`${this.backendUrl}/articles/${id}`, { headers });
  }

  updateArticleStatus(id: number, status: string, feedback?: string): Observable<Article> {
    const headers = this.getPrivateHeaders();
    if (!headers) return throwError(() => new Error('Token de autenticación no encontrado. Inicia sesión de nuevo.'));

    const body = { status, feedback };
    return this.http.put<Article>(`${this.backendUrl}/articles/${id}/status`, body, { headers });
  }
}
