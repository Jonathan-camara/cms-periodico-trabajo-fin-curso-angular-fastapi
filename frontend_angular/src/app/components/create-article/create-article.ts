import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleService } from '../../services/article';

@Component({
  selector: 'app-create-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-article.html',
  styleUrl: './create-article.css',
})
export class CreateArticle {
  private articleService = inject(ArticleService);
  private router = inject(Router);

  articleForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(5)]),
    content: new FormControl('', [
      Validators.required,
      Validators.minLength(20),
    ]),
  });

  onSubmit() {
    if (this.articleForm.valid) {
      // Usamos un type assertion o chequeamos que los valores no sean null/undefined
      const articleData = {
        title: this.articleForm.value.title!,
        content: this.articleForm.value.content!,
      };

      this.articleService.createArticle(articleData).subscribe({
        next: (response: any) => {
          console.log('Artículo creado con éxito:', response);
          alert('¡Artículo creado con éxito!');
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          console.error('Error al crear el artículo:', err);
          alert('Hubo un error al crear el artículo. Por favor, inténtalo de nuevo.');
        },
      });
    }
  }
}
