import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyDashPageAnalyticsOHComponent } from './body-dash-page-analytics-oh.component';

describe('BodyDashPageAnalyticsOHComponent', () => {
  let component: BodyDashPageAnalyticsOHComponent;
  let fixture: ComponentFixture<BodyDashPageAnalyticsOHComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyDashPageAnalyticsOHComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodyDashPageAnalyticsOHComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
