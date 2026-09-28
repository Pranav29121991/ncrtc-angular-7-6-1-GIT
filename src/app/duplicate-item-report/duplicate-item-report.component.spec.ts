import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateItemReportComponent } from './duplicate-item-report.component';

describe('DuplicateItemReportComponent', () => {
  let component: DuplicateItemReportComponent;
  let fixture: ComponentFixture<DuplicateItemReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuplicateItemReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateItemReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
