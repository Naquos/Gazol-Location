import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingGps } from './loading-gps';

describe('LoadingGps', () => {
  let component: LoadingGps;
  let fixture: ComponentFixture<LoadingGps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingGps],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingGps);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
