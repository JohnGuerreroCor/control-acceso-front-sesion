import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptInstallComponent } from './prompt-install.component';

describe('PromptInstallComponent', () => {
  let component: PromptInstallComponent;
  let fixture: ComponentFixture<PromptInstallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptInstallComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptInstallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
