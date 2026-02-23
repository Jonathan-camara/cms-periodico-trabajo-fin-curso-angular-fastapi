import { Injectable, effect } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Auth } from './auth'; // Importamos el servicio principal de Auth

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  // BehaviorSubject mantiene el último valor emitido para los nuevos suscriptores.
  private loggedIn: BehaviorSubject<boolean>;

  // Observable público para que los componentes se suscriban.
  public loggedIn$: Observable<boolean>;

  constructor(private authService: Auth) {
    // Inicializamos el BehaviorSubject con el valor actual de la señal isLoggedIn.
    // Para leer una señal, la llamas como si fuera una función.
    this.loggedIn = new BehaviorSubject<boolean>(this.authService.isLoggedIn());
    this.loggedIn$ = this.loggedIn.asObservable();

    // Creamos un 'effect' que se ejecutará cada vez que la señal 'isLoggedIn' cambie.
    // Esto mantiene nuestro BehaviorSubject sincronizado automáticamente.
    effect(() => {
      const isLoggedIn = this.authService.isLoggedIn();
      // Solo emitimos un nuevo valor si el estado ha cambiado para evitar bucles.
      if (this.loggedIn.value !== isLoggedIn) {
        this.loggedIn.next(isLoggedIn);
      }
    });
  }

  /**
   * Método para notificar a la aplicación que el estado de autenticación ha cambiado.
   * Aunque el 'effect' lo hace automático, este método puede ser útil para casos puntuales o tests.
   * @param isLoggedIn - El nuevo estado de autenticación.
   */
  updateLoggedInState(isLoggedIn: boolean) {
    this.loggedIn.next(isLoggedIn);
  }
}
