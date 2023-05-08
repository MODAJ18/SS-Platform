import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyPageAnalyticsComponent } from './body-page-analytics.component';

describe('BodyPageAnalyticsComponent', () => {
  let component: BodyPageAnalyticsComponent;
  let fixture: ComponentFixture<BodyPageAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyPageAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodyPageAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
