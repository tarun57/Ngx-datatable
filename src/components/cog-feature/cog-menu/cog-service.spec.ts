import { TestBed, inject } from '@angular/core/testing';

import { CogServiceService } from './cog-service.service';

describe('CogServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CogServiceService]
    });
  });

  it('should be created', inject([CogServiceService], (service: CogServiceService) => {
    expect(service).toBeTruthy();
  }));
});
