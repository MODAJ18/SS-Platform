import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyDashPageAnalyticsPpComponent } from './body-dash-page-analytics-pp.component';

describe('BodyDashPageAnalyticsPpComponent', () => {
  let component: BodyDashPageAnalyticsPpComponent;
  let fixture: ComponentFixture<BodyDashPageAnalyticsPpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyDashPageAnalyticsPpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodyDashPageAnalyticsPpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
