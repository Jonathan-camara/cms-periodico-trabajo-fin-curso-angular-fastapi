import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  article_id: number;
  user_id: number;
  user: {
    username: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private backendUrl = 'http://localhost:8000/api/v1';
  private http = inject(HttpClient);

  private getPrivateHeaders(): HttpHeaders | null {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : null;
  }

  getCommentsByArticle(articleId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.backendUrl}/comments/${articleId}`);
  }

  createComment(articleId: number, content: string): Observable<Comment> {
    const headers = this.getPrivateHeaders();
    if (!headers) throw new Error('Debes iniciar sesión para comentar.');
    
    return this.http.post<Comment>(`${this.backendUrl}/comments/`, { article_id: articleId, content }, { headers });
  }

  deleteComment(commentId: number): Observable<any> {
    const headers = this.getPrivateHeaders();
    if (!headers) throw new Error('No tienes permisos.');
    return this.http.delete(`${this.backendUrl}/comments/${commentId}`, { headers });
  }
}
