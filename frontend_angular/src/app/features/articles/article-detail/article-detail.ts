import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Article, ArticleService } from '../../../core/services/article';
import { Comment, CommentService } from '../../../core/services/comment';
import { Auth } from '../../../core/services/auth';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.css',
})
export class ArticleDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private commentService = inject(CommentService);
  private auth = inject(Auth);
  private cd = inject(ChangeDetectorRef);

  article: Article | null = null;
  comments: Comment[] = [];
  newCommentContent: string = '';
  isLoggedIn: boolean = false;
  isLoading = true;
  error: string | null = null;

  constructor() {
    this.isLoggedIn = this.auth.isLoggedIn();
  }

  printArticle(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  getImageUrl(): string | null {
    if (this.article && this.article.image_filename) {
      return this.articleService.getArticleImageUrl(this.article.id);
    }
    return null;
  }

  ngOnInit(): void {
    console.log('ArticleDetail: Iniciando carga...');
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isLoading = true;
          this.loadComments(+id);
          return this.articleService.getArticleById(+id);
        }
        return of(undefined);
      })
    ).subscribe({
      next: (data) => {
        this.article = data || null;
        if (!data) {
          this.error = 'No se encontró el artículo.';
        }
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('ArticleDetail: Error en la petición:', err);
        this.error = 'Error de conexión con el servidor.';
        this.isLoading = false;
        this.cd.detectChanges();
      },
    });
  }

  loadComments(articleId: number): void {
    this.commentService.getCommentsByArticle(articleId).subscribe({
      next: (data) => {
        this.comments = data;
        this.cd.detectChanges();
      }
    });
  }

  postComment(content: string): void {
    if (!content.trim() || !this.article) return;

    this.commentService.createComment(this.article.id, content).subscribe({
      next: (newComment) => {
        this.comments.push(newComment);
        this.newCommentContent = '';
        this.cd.detectChanges();
      },
      error: (err) => alert('No se pudo publicar el comentario.')
    });
  }
}
