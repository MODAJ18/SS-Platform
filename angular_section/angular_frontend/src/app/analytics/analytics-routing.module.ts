import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PageAnalyticsComponent } from './page-analytics/page-analytics.component';
import { BodyPageAnalyticsComponent } from './body-page-analytics/body-page-analytics.component';
import { BodyDashPageAnalyticsOHComponent } from './body-dash-page-analytics-oh/body-dash-page-analytics-oh.component';
import { BodyDashPageAnalyticsBSComponent } from './body-dash-page-analytics-bs/body-dash-page-analytics-bs.component';
import { BodyDashPageAnalyticsPpComponent } from './body-dash-page-analytics-pp/body-dash-page-analytics-pp.component';
import { BodyDashPageAnalyticsFsComponent } from './body-dash-page-analytics-fs/body-dash-page-analytics-fs.component';


const AnalyticsRoutes: Routes = [
  { 
    path: 'analytics',
    component: PageAnalyticsComponent,
    children: [
      {
        path: '',
        component: BodyPageAnalyticsComponent,
        data: { animation: 'BodyPage' },
        children: [ 
          {
            path: 'order-history',
            component: BodyDashPageAnalyticsOHComponent,
            data: { animation: 'orderHistoryTr' }
          },
          {
            path: 'branch-sales',
            component: BodyDashPageAnalyticsBSComponent,
            data: { animation: 'branchSalesTr' }
          },
          {
            path: 'product-performance',
            component: BodyDashPageAnalyticsPpComponent,
            data: { animation: 'productPerformanceTr' }
          },
          {
            path: 'future-sales',
            component: BodyDashPageAnalyticsFsComponent,
            data: { animation: 'futureSalesTr' }
          },
        ]
      }
    ]
  },
  { 
    path: 'analytics',   
    redirectTo: 'analytics/order-history', 
    pathMatch: 'full' 
  }
];

@NgModule({
  imports: [RouterModule.forChild(AnalyticsRoutes)],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule { 

}
