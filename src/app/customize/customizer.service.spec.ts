import { TestBed } from '@angular/core/testing';

import { CustomizerService } from './customizer.service';

describe('CustomizerService', () => {
  let service: CustomizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
