import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Article, ArticleService } from '../../services/article';
import { Auth } from '../../auth/auth';

@Component({
  selector: 'app-editor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './editor-dashboard.html',
  styleUrl: './editor-dashboard.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class EditorDashboard implements OnInit {
  private articleService = inject(ArticleService);
  private authService = inject(Auth);

  constructor(private cdr: ChangeDetectorRef) {}

  public articles: Article[] = [];
  isLoading = true;
  userRole: string | null = null;
  error: string | null = null;

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.loadArticles();
  }

  loadArticles(): void {
    this.isLoading = true;
    this.error = null;
    this.articleService.getArticlesForDashboard().subscribe({
      next: (data) => {
        this.articles = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching editor dashboard articles:', err);
        this.error = 'No se pudo cargar la lista de artículos.';
        this.isLoading = false;
      }
    });
  }

  deleteArticle(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este artículo? Esta acción no se puede deshacer.')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          this.articles = this.articles.filter(article => article.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(`Error deleting article ${id}:`, err);
          alert('No se pudo eliminar el artículo. Es posible que no tengas los permisos necesarios.');
        }
      });
    }
  }

  updateStatus(id: number, status: 'draft' | 'review' | 'published'): void {
    this.articleService.updateArticleStatus(id, status).subscribe({
      next: (updatedArticle) => {
        const index = this.articles.findIndex(article => article.id === id);
        if (index !== -1) {
          this.articles[index] = updatedArticle;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(`Error updating status for article ${id}:`, err);
        alert('No se pudo actualizar el estado del artículo.');
      }
    });
  }

  trackById(index: number, article: Article): number {
    return article.id;
  }
}
