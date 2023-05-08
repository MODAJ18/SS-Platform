import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyDashPageAnalyticsBSComponent } from './body-dash-page-analytics-bs.component';

describe('BodyDashPageAnalyticsBSComponent', () => {
  let component: BodyDashPageAnalyticsBSComponent;
  let fixture: ComponentFixture<BodyDashPageAnalyticsBSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyDashPageAnalyticsBSComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodyDashPageAnalyticsBSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
