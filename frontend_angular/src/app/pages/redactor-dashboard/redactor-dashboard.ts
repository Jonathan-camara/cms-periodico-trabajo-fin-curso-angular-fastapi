import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Article, ArticleService } from '../../services/article';
import { Auth } from '../../auth/auth';

@Component({
  selector: 'app-redactor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './redactor-dashboard.html',
  styleUrl: './redactor-dashboard.css',
})
export class RedactorDashboard implements OnInit {
  private articleService = inject(ArticleService);
  private authService = inject(Auth);

  constructor(private cdr: ChangeDetectorRef) {}

  articles: Article[] = [];
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
        console.error('Error fetching redactor dashboard articles:', err);
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

  // Los redactores no actualizan el estado directamente desde este dashboard, pero la función podría ser útil si cambiara el flujo.
  // Por ahora, no se usa en la plantilla, pero se mantiene la capacidad si fuera necesario.
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

  get currentUserId(): number | null {
    return this.authService.getUserId();
  }
}
