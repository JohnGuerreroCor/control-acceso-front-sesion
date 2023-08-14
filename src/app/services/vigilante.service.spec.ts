import { TestBed } from '@angular/core/testing';

import { VigilanteService } from './vigilante.service';

describe('VigilanteService', () => {
  let service: VigilanteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VigilanteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
