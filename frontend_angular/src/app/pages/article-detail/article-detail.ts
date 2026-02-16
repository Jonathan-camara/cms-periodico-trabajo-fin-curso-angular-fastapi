import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Article, ArticleService } from '../../services/article';
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

  article: Article | undefined;
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isLoading = true;
          this.error = null;
          return this.articleService.getArticleById(+id);
        }
        return of(undefined);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.article = data;
        } else {
          this.error = 'No se encontró el ID del artículo en la URL.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching article:', err);
        this.error = 'No se pudo cargar el artículo. Por favor, inténtalo de nuevo más tarde.';
        this.isLoading = false;
      },
    });
  }
}
