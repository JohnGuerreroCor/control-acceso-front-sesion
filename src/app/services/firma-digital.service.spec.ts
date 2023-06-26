import { TestBed } from '@angular/core/testing';

import { FirmaDigitalService } from './firma-digital.service';

describe('FirmaDigitalService', () => {
  let service: FirmaDigitalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirmaDigitalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
