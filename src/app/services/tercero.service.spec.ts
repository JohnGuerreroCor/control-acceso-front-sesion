import { TestBed } from '@angular/core/testing';

import { TerceroService } from './tercero.service';

describe('TerceroService', () => {
  let service: TerceroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TerceroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
