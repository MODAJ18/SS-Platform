import { Component } from '@angular/core';
import { menuHoverAnimation, menuIconHoverAnimation } from '../animations';

@Component({
  selector: 'app-header-main',
  templateUrl: './header-main.component.html',
  styleUrls: ['./header-main.component.css'],
  animations: [ menuHoverAnimation, menuIconHoverAnimation ]
})
export class HeaderMainComponent {
  menuHover = "off";
  iconHover = "off";
  header_title = "SS-A&M";
  analytics_icon_path = "../../assets/exploratory-analysis.png";
  ml_icon_path = "../../assets/machine-learning.png";

  mouseEnter(status: string) {
    this.menuHover = status;
  }
  mouseLeave(status: string) {
    this.menuHover = status;
  }

  iconEnter(status: string) {
    this.iconHover = status;
  }
  iconLeave(status: string) {
    this.iconHover = status;
  }
}
