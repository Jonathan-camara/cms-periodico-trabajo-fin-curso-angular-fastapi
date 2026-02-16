import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true, // Asegúrate de que sea standalone
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  currentYear: number = new Date().getFullYear();
}
