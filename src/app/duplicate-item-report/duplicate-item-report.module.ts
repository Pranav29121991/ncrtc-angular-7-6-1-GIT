import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DuplicateItemReportRoutingModule } from './duplicate-item-report-routing.module';
import { DuplicateItemReportComponent } from './duplicate-item-report.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [DuplicateItemReportComponent],
  imports: [
    CommonModule,
    SharedModule,
    DuplicateItemReportRoutingModule
  ]
})
export class DuplicateItemReportModule { }
