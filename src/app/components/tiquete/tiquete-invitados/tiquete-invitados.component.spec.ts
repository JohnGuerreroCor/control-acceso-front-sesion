import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiqueteInvitadosComponent } from './tiquete-invitados.component';

describe('TiqueteInvitadosComponent', () => {
  let component: TiqueteInvitadosComponent;
  let fixture: ComponentFixture<TiqueteInvitadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TiqueteInvitadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiqueteInvitadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
