import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedactorDashboard } from './redactor-dashboard';

describe('RedactorDashboard', () => {
  let component: RedactorDashboard;
  let fixture: ComponentFixture<RedactorDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedactorDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedactorDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
