import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Article, ArticleService } from '../../../core/services/article';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ArticleStateService } from '../../../core/services/article-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article-list.html',
  styleUrl: './article-list.css',
})
export class ArticleList implements OnInit, OnDestroy {
  private articleService = inject(ArticleService);
  private articleStateService = inject(ArticleStateService);
  private route = inject(ActivatedRoute);
  private refreshSubscription!: Subscription;
  private queryParamsSubscription!: Subscription;
  private cd = inject(ChangeDetectorRef); // Inyectar ChangeDetectorRef

  articles: Article[] = [];
  filteredArticles: Article[] = [];
  categories: string[] = ['Todas', 'Nacional', 'Internacional', 'Economía', 'Deportes', 'Cultura', 'Tecnología', 'Opinión'];
  selectedCategory: string = 'Todas';
  searchQuery: string = '';
  isLoading = true;

  getImageUrl(article: Article): string | null {
    if (article.image_filename) {
      return this.articleService.getArticleImageUrl(article.id);
    }
    return null;
  }

  ngOnInit(): void {
    // Escuchamos parámetros de la URL (para el buscador y el menú del header)
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['cat'] || 'Todas';
      this.searchQuery = params['q'] || '';
      this.loadArticles();
    });

    // Nos suscribimos a los cambios. Cada vez que se notifique un cambio, recargamos la lista.
    this.refreshSubscription = this.articleStateService.articleListChanged$.subscribe(() => {
        this.loadArticles();
      }
    );
  }

  loadArticles(): void {
    this.isLoading = true;
    this.articleService.getArticlesForDashboard().subscribe({
      next: (data: Article[]) => {
        this.articles = data;
        this.applyFilters();
        this.isLoading = false;
        this.cd.detectChanges(); // Forzar la detección de cambios
      },
      error: (err: any) => {
        console.error('Error fetching articles:', err);
        this.isLoading = false;
        this.cd.detectChanges(); // Forzar la detección de cambios también en caso de error
      },
    });
  }

  applyFilters(): void {
    let result = this.articles;

    // 1. Filtrar por categoría
    if (this.selectedCategory !== 'Todas') {
      result = result.filter(a => a.category === this.selectedCategory);
    }

    // 2. Filtrar por búsqueda
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.content.toLowerCase().includes(q)
      );
    }

    this.filteredArticles = result;
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  ngOnDestroy(): void {
    // Es muy importante desuscribirse para evitar fugas de memoria.
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }
}
