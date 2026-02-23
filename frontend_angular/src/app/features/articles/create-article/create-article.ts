import { Component, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ArticleService } from '../../../core/services/article';
import { ArticleStateService } from '../../../core/services/article-state.service'; 

declare var Quill: any; // Declarar Quill para que TS no se queje

@Component({
  selector: 'app-create-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-article.html',
  styleUrl: './create-article.css',
})
export class CreateArticle implements AfterViewInit {
  private articleService = inject(ArticleService);
  private router = inject(Router);
  private articleStateService = inject(ArticleStateService);
  
  @ViewChild('editor') editorElement!: ElementRef;
  quill: any;
  selectedFile: File | null = null;

  articleForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(5)]),
    content: new FormControl('', [Validators.required]),
    category: new FormControl('Nacional', [Validators.required]),
  });

  ngAfterViewInit() {
    this.quill = new Quill(this.editorElement.nativeElement, {
      theme: 'snow',
      placeholder: 'Escribe el cuerpo de la noticia con estilo...',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'header': [1, 2, 3, false] }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link', 'clean']
        ]
      }
    });

    // Sincronizar Quill con el control de formulario de Angular
    this.quill.on('text-change', () => {
      const html = this.quill.root.innerHTML;
      this.articleForm.get('content')?.setValue(html === '<p><br></p>' ? '' : html);
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  onSubmit() {
    if (this.articleForm.valid) {
      const formData = new FormData();
      formData.append('title', this.articleForm.value.title!);
      formData.append('content', this.articleForm.value.content!);
      formData.append('category', this.articleForm.value.category!);
      formData.append('status_art', 'draft'); 

      if (this.selectedFile) {
        formData.append('file', this.selectedFile, this.selectedFile.name);
      }

      this.articleService.createArticle(formData).subscribe({
        next: (response: any) => {
          alert('¡Artículo creado con éxito!');
          this.articleStateService.notifyArticleListChanged();
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          console.error('Error al crear el artículo:', err);
          alert('Hubo un error al crear el artículo.');
        },
      });
    }
  }
}
