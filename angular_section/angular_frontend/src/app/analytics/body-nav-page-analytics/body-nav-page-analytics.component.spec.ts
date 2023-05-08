import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyNavPageAnalyticsComponent } from './body-nav-page-analytics.component';

describe('BodyNavPageAnalyticsComponent', () => {
  let component: BodyNavPageAnalyticsComponent;
  let fixture: ComponentFixture<BodyNavPageAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyNavPageAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodyNavPageAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
