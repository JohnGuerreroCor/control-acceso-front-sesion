import { TestBed } from '@angular/core/testing';

import { PublicoService } from './publico.service';

describe('PublicoService', () => {
  let service: PublicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
