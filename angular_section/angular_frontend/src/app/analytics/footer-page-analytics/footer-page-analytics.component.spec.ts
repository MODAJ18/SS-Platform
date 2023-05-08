import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterPageAnalyticsComponent } from './footer-page-analytics.component';

describe('FooterPageAnalyticsComponent', () => {
  let component: FooterPageAnalyticsComponent;
  let fixture: ComponentFixture<FooterPageAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterPageAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterPageAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
