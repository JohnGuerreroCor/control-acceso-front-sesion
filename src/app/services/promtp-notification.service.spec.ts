import { TestBed } from '@angular/core/testing';

import { PromtpNotificationService } from './promtp-notification.service';

describe('PromtpNotificationService', () => {
  let service: PromtpNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromtpNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
