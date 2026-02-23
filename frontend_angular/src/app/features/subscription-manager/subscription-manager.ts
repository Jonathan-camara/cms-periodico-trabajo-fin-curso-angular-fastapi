import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, Subscription } from '../../core/services/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subscription-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="subscription-page">
      <div class="header">
        <h1>Gestión de Suscripción</h1>
        <p>Elige el plan que mejor se adapte a tus necesidades periodísticas.</p>
      </div>

      <div class="plans-container">
        <!-- Plan Gratuito -->
        <div class="plan-card" [class.active]="currentPlan === 'free'">
          <div class="plan-header">
            <h3>Gratuito</h3>
            <div class="price">0€<span>/mes</span></div>
          </div>
          <ul class="features">
            <li><i class="fas fa-check"></i> Escritura de borradores</li>
            <li><i class="fas fa-check"></i> Lectura de noticias</li>
            <li class="disabled"><i class="fas fa-times"></i> Sin soporte prioritario</li>
          </ul>
          <button (click)="changePlan('free')" [disabled]="currentPlan === 'free'" class="btn-plan">
            {{ currentPlan === 'free' ? 'Tu Plan Actual' : 'Seleccionar' }}
          </button>
        </div>

        <!-- Plan Premium -->
        <div class="plan-card featured" [class.active]="currentPlan === 'premium'">
          <div class="best-value">RECOMENDADO</div>
          <div class="plan-header">
            <h3>Premium</h3>
            <div class="price">9.99€<span>/mes</span></div>
          </div>
          <ul class="features">
            <li><i class="fas fa-check"></i> Escritura ilimitada</li>
            <li><i class="fas fa-check"></i> Imágenes en alta calidad</li>
            <li><i class="fas fa-check"></i> Soporte 24/7</li>
          </ul>
          <button (click)="changePlan('premium')" [disabled]="currentPlan === 'premium'" class="btn-plan featured">
            {{ currentPlan === 'premium' ? 'Tu Plan Actual' : 'Mejorar Ahora' }}
          </button>
        </div>

        <!-- Plan Pro -->
        <div class="plan-card" [class.active]="currentPlan === 'pro'">
          <div class="plan-header">
            <h3>Pro Editorial</h3>
            <div class="price">29.99€<span>/mes</span></div>
          </div>
          <ul class="features">
            <li><i class="fas fa-check"></i> Todo lo de Premium</li>
            <li><i class="fas fa-check"></i> Estadísticas avanzadas</li>
            <li><i class="fas fa-check"></i> Herramientas de edición</li>
          </ul>
          <button (click)="changePlan('pro')" [disabled]="currentPlan === 'pro'" class="btn-plan">
            {{ currentPlan === 'pro' ? 'Tu Plan Actual' : 'Seleccionar' }}
          </button>
        </div>
      </div>

      <div class="back-link">
        <button (click)="goBack()">Volver al Dashboard</button>
      </div>
    </div>
  `,
  styles: [`
    .subscription-page {
      max-width: 1000px;
      margin: 60px auto;
      padding: 0 20px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .header { text-align: center; margin-bottom: 50px; }
    .header h1 { font-family: 'Georgia', serif; font-size: 3rem; color: #1e3a8a; margin-bottom: 10px; }
    .header p { color: #64748b; font-size: 1.1rem; }
    
    .plans-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .plan-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      transition: all 0.3s ease;
      position: relative;
    }
    .plan-card.featured { border: 2px solid #2563eb; transform: scale(1.05); box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.1); }
    .plan-card.active { border-color: #10b981; background-color: #f0fdf4; }
    
    .best-value {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #2563eb;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 800;
    }
    
    .plan-header h3 { font-size: 1.5rem; color: #1e293b; margin-bottom: 20px; }
    .price { font-size: 2.5rem; font-weight: bold; color: #1e3a8a; margin-bottom: 30px; }
    .price span { font-size: 1rem; color: #64748b; font-weight: normal; }
    
    .features { list-style: none; padding: 0; margin: 0 0 40px 0; text-align: left; }
    .features li { margin-bottom: 15px; color: #475569; font-size: 0.95rem; display: flex; align-items: center; gap: 10px; }
    .features li.disabled { color: #94a3b8; text-decoration: line-through; }
    .features li i { font-size: 0.8rem; }
    .features li i.fa-check { color: #10b981; }
    .features li i.fa-times { color: #ef4444; }
    
    .btn-plan {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid #2563eb;
      background: transparent;
      color: #2563eb;
    }
    .btn-plan:hover:not(:disabled) { background: #eff6ff; }
    .btn-plan.featured { background: #2563eb; color: white; }
    .btn-plan.featured:hover:not(:disabled) { background: #1d4ed8; }
    .btn-plan:disabled { background: #f1f5f9; border-color: #e2e8f0; color: #94a3b8; cursor: default; }
    
    .back-link { text-align: center; }
    .back-link button { background: none; border: none; color: #64748b; text-decoration: underline; cursor: pointer; font-size: 0.9rem; }
  `]
})
export class SubscriptionManager implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  currentPlan: string = 'free';

  ngOnInit(): void {
    this.userService.getMySubscription().subscribe({
      next: (sub) => {
        this.currentPlan = sub.plan;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error loading sub:', err)
    });
  }

  changePlan(newPlan: string): void {
    if (confirm(`¿Deseas cambiar tu plan a ${newPlan.toUpperCase()}?`)) {
      this.userService.updateMySubscription(newPlan).subscribe({
        next: (sub) => {
          this.currentPlan = sub.plan;
          alert('¡Suscripción actualizada con éxito!');
          this.cd.detectChanges();
        },
        error: (err) => alert('Hubo un error al procesar tu solicitud.')
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
