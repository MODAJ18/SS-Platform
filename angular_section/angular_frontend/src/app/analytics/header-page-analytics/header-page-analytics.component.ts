import { Component } from '@angular/core';

import { menuHoverAnimation } from '../../animations';

@Component({
  selector: 'app-header-page-analytics',
  templateUrl: './header-page-analytics.component.html',
  styleUrls: ['./header-page-analytics.component.css'],
  animations: [ menuHoverAnimation ]
})
export class HeaderPageAnalyticsComponent {
  menuHover = "off";
  header_title = "SS-A&M";

  mouseEnter(status: string) {
    this.menuHover = status;
  }
  mouseLeave(status: string) {
    this.menuHover = status;
  }

}
