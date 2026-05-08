import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListLocation } from './list-location';

describe('ListLocation', () => {
  let component: ListLocation;
  let fixture: ComponentFixture<ListLocation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListLocation],
    }).compileComponents();

    fixture = TestBed.createComponent(ListLocation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
