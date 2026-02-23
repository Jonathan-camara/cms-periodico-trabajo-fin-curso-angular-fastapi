import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription as RxjsSubscription } from 'rxjs';
import { Article, ArticleService } from '../../../core/services/article';
import { Auth } from '../../../core/services/auth';
import { ArticleStateService } from '../../../core/services/article-state.service';
import { UserService, Subscription } from '../../../core/services/user';

@Component({
  selector: 'app-editor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './editor-dashboard.html',
  styleUrl: './editor-dashboard.css',
})
export class EditorDashboard implements OnInit, OnDestroy {
  private articleService = inject(ArticleService);
  private authService = inject(Auth);
  private userService = inject(UserService);
  private articleStateService = inject(ArticleStateService);
  private cd = inject(ChangeDetectorRef); // Inyectar ChangeDetectorRef

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

    // Suscribirse a los cambios en la lista de artículos
    this.articleChangesSubscription = this.articleStateService.articleListChanged$.subscribe(() => {
      console.log('Notificación recibida, recargando artículos...');
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
    // Es crucial desuscribirse para evitar fugas de memoria
    if (this.articleChangesSubscription) {
      this.articleChangesSubscription.unsubscribe();
    }
  }

  loadArticles(): void {
    this.isLoading = true;
    this.error = null;
    this.cd.detectChanges(); // Forzar actualización para mostrar "Cargando..."
    this.articleService.getArticlesForDashboard().subscribe({
      next: (data: Article[]) => {
        this.articles = data;
        this.isLoading = false;
        this.cd.detectChanges(); // Forzar la detección de cambios de forma síncrona
      },
      error: (err: any) => {
        console.error('Error fetching editor dashboard articles:', err);
        this.error = 'No se pudo cargar la lista de artículos.';
        this.isLoading = false;
        this.cd.detectChanges(); // Forzar la detección de cambios también en caso de error
      }
    });
  }

  deleteArticle(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este artículo? Esta acción no se puede deshacer.')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          // En lugar de filtrar localmente, podemos notificar y dejar que la recarga se ocupe
          this.articleStateService.notifyArticleListChanged();
        },
        error: (err) => {
          console.error(`Error deleting article ${id}:`, err);
          alert('No se pudo eliminar el artículo. Es posible que no tengas los permisos necesarios.');
        }
      });
    }
  }

  updateStatus(id: number, status: 'draft' | 'review' | 'published'): void {
    let feedback: string | undefined;

    if (status === 'draft') { // Si se está rechazando (volviendo a borrador)
      const reason = prompt('Indica el motivo del rechazo para el redactor:');
      if (reason === null) return; // Si cancela, no hacemos nada
      feedback = reason;
    }

    this.articleService.updateArticleStatus(id, status, feedback).subscribe({
      next: (updatedArticle) => {
        const index = this.articles.findIndex(article => article.id === id);
        if (index !== -1) {
          this.articles[index] = updatedArticle;
          this.cd.detectChanges(); // Actualizar la vista después de cambiar un estado
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
