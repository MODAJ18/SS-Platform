import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionsMainComponent } from './sections-main.component';

describe('SectionsMainComponent', () => {
  let component: SectionsMainComponent;
  let fixture: ComponentFixture<SectionsMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SectionsMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
