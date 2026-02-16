import { Component } from '@angular/core';
import { ArticleList } from '../article-list/article-list'; // Importa el ArticleListComponent

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [ArticleList], // Añade ArticleListComponent aquí
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {

}
