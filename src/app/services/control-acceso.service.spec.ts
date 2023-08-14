import { TestBed } from '@angular/core/testing';

import { ControlAccesoService } from './control-acceso.service';

describe('ControlAccesoService', () => {
  let service: ControlAccesoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControlAccesoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
