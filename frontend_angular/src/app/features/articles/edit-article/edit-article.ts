import { Component, OnInit, inject, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../../core/services/article';
import { switchMap } from 'rxjs/operators';

declare var Quill: any;

@Component({
  selector: 'app-edit-article',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-article.html',
  styleUrls: ['./edit-article.css']
})
export class EditArticle implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private cd = inject(ChangeDetectorRef);

  @ViewChild('editor') editorElement!: ElementRef;
  quill: any;
  articleForm: FormGroup;
  isLoading = true;
  error: string | null = null;
  articleId: number | null = null;
  selectedFile: File | null = null;

  constructor() {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      category: ['Nacional', Validators.required]
    });
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0] as File;
    }
  }

  ngAfterViewInit() {
    // La inicialización real ocurrirá cuando carguen los datos
  }

  initQuill(initialContent: string) {
    if (!this.editorElement) return;
    
    this.quill = new Quill(this.editorElement.nativeElement, {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'header': [1, 2, 3, false] }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link', 'clean']
        ]
      }
    });

    this.quill.root.innerHTML = initialContent;

    this.quill.on('text-change', () => {
      this.articleForm.get('content')?.setValue(this.quill.root.innerHTML);
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
        console.log('Artículo cargado para editar:', article);
        this.articleForm.patchValue({
          title: article.title,
          content: article.content,
          category: article.category
        });
        
        // Finalizamos la carga antes del timeout
        this.isLoading = false;
        this.cd.detectChanges();
        
        // Esperamos un ciclo para que el ViewChild esté disponible con un margen seguro
        setTimeout(() => {
          try {
            this.initQuill(article.content);
          } catch (e) {
            console.error('Error al inicializar Quill:', e);
            this.error = 'El editor de texto no cargó correctamente, pero el contenido se ha recuperado.';
          }
        }, 200);
      },
      error: (err) => {
        console.error('Error loading article for editing:', err);
        this.error = 'No se pudo cargar el artículo para editar. Verifica los permisos del editor o la conexión al servidor (Puerto 8000).';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.articleForm.invalid || !this.articleId) {
      return;
    }
    this.isLoading = true;

    const formData = new FormData();
    formData.append('title', this.articleForm.get('title')?.value);
    formData.append('content', this.articleForm.get('content')?.value);
    formData.append('category', this.articleForm.get('category')?.value);
    
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    this.articleService.updateArticle(this.articleId, formData as any).subscribe({
      next: () => {
        alert('Artículo actualizado con éxito.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error updating article:', err);
        this.error = 'Ocurrió un error al actualizar el artículo. Es posible que el artículo ya haya sido publicado o no tengas permisos.';
        this.isLoading = false;
        this.cd.detectChanges();
      }
    });
  }
}
