import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';

import { PageAnalyticsComponent } from './page-analytics/page-analytics.component';
import { HeaderPageAnalyticsComponent } from './header-page-analytics/header-page-analytics.component';
import { BodyPageAnalyticsComponent } from './body-page-analytics/body-page-analytics.component';
import { FooterPageAnalyticsComponent } from './footer-page-analytics/footer-page-analytics.component';
import { BodyNavPageAnalyticsComponent } from './body-nav-page-analytics/body-nav-page-analytics.component';
import { BodyDashPageAnalyticsBSComponent } from './body-dash-page-analytics-bs/body-dash-page-analytics-bs.component';
import { BodyDashPageAnalyticsOHComponent } from './body-dash-page-analytics-oh/body-dash-page-analytics-oh.component';
import { BodyDashPageAnalyticsPpComponent } from './body-dash-page-analytics-pp/body-dash-page-analytics-pp.component';
import { BodyDashPageAnalyticsFsComponent } from './body-dash-page-analytics-fs/body-dash-page-analytics-fs.component';

@NgModule({
  declarations: [
    HeaderPageAnalyticsComponent,
    BodyPageAnalyticsComponent,
    FooterPageAnalyticsComponent,
    BodyNavPageAnalyticsComponent,
    PageAnalyticsComponent,
    BodyDashPageAnalyticsBSComponent,
    BodyDashPageAnalyticsOHComponent,
    BodyDashPageAnalyticsPpComponent,
    BodyDashPageAnalyticsFsComponent
  ],
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ]
})
export class AnalyticsModule { 
  
}
