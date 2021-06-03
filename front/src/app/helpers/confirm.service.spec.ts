import { TestBed } from '@angular/core/testing';

import { Confirm } from './confirm.service';

describe('ConfirmService', () => {
  let service: Confirm;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Confirm);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
