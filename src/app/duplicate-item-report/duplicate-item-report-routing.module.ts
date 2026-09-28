import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { I18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { DuplicateItemReportComponent } from './duplicate-item-report.component';

const routes: Routes = [{ path: '', component: DuplicateItemReportComponent, resolve: { breadcrumb: I18nBreadcrumbResolver }, data: { breadcrumbKey: 'duplicateitemreport', title: 'duplicateitemreport' } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DuplicateItemReportRoutingModule { }
