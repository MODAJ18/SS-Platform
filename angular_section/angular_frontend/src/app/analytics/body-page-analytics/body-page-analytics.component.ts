import { Component } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { ChildrenOutletContexts } from '@angular/router';

import { slideInAnimation } from '../../animations';

@Component({
  selector: 'app-body-page-analytics',
  templateUrl: './body-page-analytics.component.html',
  styleUrls: ['./body-page-analytics.component.css'],
  animations: [ slideInAnimation ]
})
export class BodyPageAnalyticsComponent  {
  constructor(private route: ActivatedRoute, private router: Router, private contexts: ChildrenOutletContexts) { }

  getAnimationData() {
    console.log(this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation']);
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  ngOnInit(): void {
  }
}
