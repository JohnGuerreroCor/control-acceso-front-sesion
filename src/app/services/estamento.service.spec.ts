import { TestBed } from '@angular/core/testing';

import { EstamentoService } from './estamento.service';

describe('EstamentoService', () => {
  let service: EstamentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstamentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
