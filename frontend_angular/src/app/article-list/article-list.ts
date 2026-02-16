import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Article, ArticleService } from '../services/article';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article-list.html',
  styleUrl: './article-list.css',
})
export class ArticleList implements OnInit {
  private articleService = inject(ArticleService);

  articles: Article[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.isLoading = true;
    this.articleService.getArticles().subscribe({
      next: (data) => {
        this.articles = data;
        this.isLoading = false;
        console.log('Artículos cargados:', this.articles);
      },
      error: (err) => {
        console.error('Error fetching articles:', err);
        this.isLoading = false;
      },
    });
  }
}
