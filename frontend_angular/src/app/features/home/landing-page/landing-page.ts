import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // Importar RouterLink
import { ArticleList } from '../../articles/article-list/article-list'; // Importa el ArticleListComponent

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [ArticleList, RouterLink], // Añadir RouterLink aquí
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {

}
