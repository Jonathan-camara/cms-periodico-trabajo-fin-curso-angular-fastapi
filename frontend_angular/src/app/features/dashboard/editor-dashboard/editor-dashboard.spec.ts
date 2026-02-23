import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorDashboard } from './editor-dashboard';

describe('EditorDashboard', () => {
  let component: EditorDashboard;
  let fixture: ComponentFixture<EditorDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
