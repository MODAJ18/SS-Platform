import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAnalyticsComponent } from './page-analytics.component';

describe('PageAnalyticsComponent', () => {
  let component: PageAnalyticsComponent;
  let fixture: ComponentFixture<PageAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
