import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyDashPageAnalyticsFsComponent } from './body-dash-page-analytics-fs.component';

describe('BodyDashPageAnalyticsFsComponent', () => {
  let component: BodyDashPageAnalyticsFsComponent;
  let fixture: ComponentFixture<BodyDashPageAnalyticsFsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyDashPageAnalyticsFsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodyDashPageAnalyticsFsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
