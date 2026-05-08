import { TestBed } from '@angular/core/testing';

import { CarburantApi } from './carburant-api';

describe('CarburantApi', () => {
  let service: CarburantApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarburantApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
