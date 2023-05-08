import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// Routing
import { RouterModule, Routes } from '@angular/router';
// HTTP Client (for using api)
import { HttpClientModule } from '@angular/common/http';
// Animations
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { ConfigComponent } from './config/config.component';
import { HeaderMainComponent } from './header-main/header-main.component';
import { BodyMainComponent } from './body-main/body-main.component';
import { SectionsMainComponent } from './sections-main/sections-main.component';
import { FooterMainComponent } from './footer-main/footer-main.component';
import { PageMainComponent } from './page-main/page-main.component';
import { AppRoutingModule } from './app-routing.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MyChartComponent } from './my-chart/my-chart.component';


@NgModule({
  declarations: [
    AppComponent,
    ConfigComponent,
    HeaderMainComponent,
    BodyMainComponent,
    SectionsMainComponent,
    FooterMainComponent,
    PageMainComponent,
    MyChartComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AnalyticsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 
}
