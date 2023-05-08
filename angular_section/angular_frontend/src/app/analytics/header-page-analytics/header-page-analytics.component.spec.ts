import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderPageAnalyticsComponent } from './header-page-analytics.component';

describe('HeaderPageAnalyticsComponent', () => {
  let component: HeaderPageAnalyticsComponent;
  let fixture: ComponentFixture<HeaderPageAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderPageAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderPageAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
