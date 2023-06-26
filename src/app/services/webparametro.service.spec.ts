import { TestBed } from '@angular/core/testing';

import { WebparametroService } from './webparametro.service';

describe('WebparametroService', () => {
  let service: WebparametroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebparametroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
