import { TestBed } from '@angular/core/testing';

import { NavbarHiddenService } from './navbar-hidden.service';

describe('NavbarHiddenService', () => {
  let service: NavbarHiddenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavbarHiddenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
