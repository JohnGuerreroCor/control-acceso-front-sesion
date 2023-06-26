import { EmailHidePipe } from './email-hide.pipe';

describe('EmailHidePipe', () => {
  it('create an instance', () => {
    const pipe = new EmailHidePipe();
    expect(pipe).toBeTruthy();
  });
});
