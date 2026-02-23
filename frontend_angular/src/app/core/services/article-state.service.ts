import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ArticleStateService {
  private articleListChanged = new Subject<void>();

  // Observable que los componentes pueden escuchar
  articleListChanged$ = this.articleListChanged.asObservable();

  // Método para emitir el evento de cambio
  notifyArticleListChanged() {
    this.articleListChanged.next();
  }
}
