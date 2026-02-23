import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription as RxjsSubscription } from 'rxjs';
import { Article, ArticleService } from '../../../core/services/article';
import { Auth } from '../../../core/services/auth';
import { ArticleStateService } from '../../../core/services/article-state.service';
import { UserService, Subscription } from '../../../core/services/user';

@Component({
  selector: 'app-redactor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './redactor-dashboard.html',
  styleUrl: './redactor-dashboard.css',
})
export class RedactorDashboard implements OnInit, OnDestroy {
  private articleService = inject(ArticleService);
  private authService = inject(Auth);
  private userService = inject(UserService);
  private articleStateService = inject(ArticleStateService);
  private cd = inject(ChangeDetectorRef);

  articles: Article[] = [];
  isLoading = true;
  userRole: string | null = null;
  error: string | null = null;
  userSubscription: Subscription | null = null;
  
  private articleChangesSubscription!: RxjsSubscription;

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.loadArticles();
    this.loadSubscription();

    // Suscribirse a los cambios para que la lista se actualice sola
    this.articleChangesSubscription = this.articleStateService.articleListChanged$.subscribe(() => {
      this.loadArticles();
    });
  }

  loadSubscription(): void {
    this.userService.getMySubscription().subscribe({
      next: (sub) => {
        this.userSubscription = sub;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading subscription:', err)
    });
  }

  ngOnDestroy(): void {
    if (this.articleChangesSubscription) {
      this.articleChangesSubscription.unsubscribe();
    }
  }

  loadArticles(): void {
    this.isLoading = true;
    this.error = null;
    this.cd.detectChanges(); // Mostrar "Cargando..."
    this.articleService.getArticlesForDashboard().subscribe({
      next: (data: Article[]) => {
        this.articles = data;
        this.isLoading = false;
        this.cd.detectChanges(); // Forzar actualización de la vista
      },
      error: (err: any) => {
        console.error('Error fetching redactor dashboard articles:', err);
        this.error = 'No se pudo cargar la lista de artículos.';
        this.isLoading = false;
        this.cd.detectChanges(); // Forzar actualización en caso de error
      }
    });
  }

  deleteArticle(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este artículo? Esta acción no se puede deshacer.')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          // Notificar a toda la app que la lista ha cambiado, en lugar de solo filtrar localmente
          this.articleStateService.notifyArticleListChanged();
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
          this.cd.detectChanges();
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
