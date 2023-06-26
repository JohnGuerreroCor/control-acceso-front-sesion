import { TestBed } from '@angular/core/testing';

import { TokenInternoService } from './token-interno.service';

describe('TokenInternoService', () => {
  let service: TokenInternoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenInternoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
