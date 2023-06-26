import { TestBed } from '@angular/core/testing';

import { GraduadoService } from './graduado.service';

describe('GraduadoService', () => {
  let service: GraduadoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraduadoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
