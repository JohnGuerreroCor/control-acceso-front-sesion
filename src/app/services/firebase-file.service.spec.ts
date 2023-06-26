import { TestBed } from '@angular/core/testing';

import { FirebaseFileService } from './firebase-file.service';

describe('FirebaseFileService', () => {
  let service: FirebaseFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
