import { TestBed } from '@angular/core/testing';

import { CastorAPIService } from './castor-api.service';

describe('CastorAPIService', () => {
  let service: CastorAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CastorAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
