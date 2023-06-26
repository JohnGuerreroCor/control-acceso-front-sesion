import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiqueteVisitantesComponent } from './tiquete-visitantes.component';

describe('TiqueteVisitantesComponent', () => {
  let component: TiqueteVisitantesComponent;
  let fixture: ComponentFixture<TiqueteVisitantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TiqueteVisitantesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiqueteVisitantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
