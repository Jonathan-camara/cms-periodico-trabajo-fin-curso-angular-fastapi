import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../services/article';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-edit-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-article.html',
  styleUrls: ['./edit-article.css']
})
export class EditArticle implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);

  articleForm: FormGroup;
  isLoading = true;
  error: string | null = null;
  articleId: number | null = null;

  constructor() {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.articleId = +id;
          return this.articleService.getArticleById(this.articleId);
        }
        throw new Error('ID de artículo no encontrado');
      })
    ).subscribe({
      next: (article) => {
        this.articleForm.patchValue({
          title: article.title,
          content: article.content
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading article for editing:', err);
        this.error = 'No se pudo cargar el artículo para editar.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.articleForm.invalid || !this.articleId) {
      return;
    }
    this.isLoading = true;
    this.articleService.updateArticle(this.articleId, this.articleForm.value).subscribe({
      next: () => {
        alert('Artículo actualizado con éxito.');
        this.router.navigate(['/dashboard/articulos']);
      },
      error: (err) => {
        console.error('Error updating article:', err);
        this.error = 'Ocurrió un error al actualizar el artículo.';
        this.isLoading = false;
      }
    });
  }
}
