import { Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { futureSalesSchema, APIService } from '../../config/config.service';
import { filterHover_yTrigger,
         filterHover_qTrigger, 
         filterHover_mTrigger,
         KPIHover1_Trigger,
         KPIHover2_Trigger
      } from '../../animations';


Chart.defaults.color = "#fff";
Chart.defaults.borderColor = '#6d6875';
Chart.register(...registerables);

@Component({
  selector: 'app-body-dash-page-analytics-fs',
  templateUrl: './body-dash-page-analytics-fs.component.html',
  styleUrls: ['./body-dash-page-analytics-fs.component.css'],
  providers: [ APIService ],
  animations: [ filterHover_yTrigger,
                filterHover_qTrigger,
                filterHover_mTrigger,
                KPIHover1_Trigger,
                KPIHover2_Trigger ]
})
export class BodyDashPageAnalyticsFsComponent {
  future_sales: futureSalesSchema[] | undefined;
  monthly_future_sales: any = {};
  estimated_total_profit: any;
  estimated_total_customer_count: any;

  future_sales_chart: any;
  future_customer_num_chart: any;
  filterHover: string = "off";
  filterStatus: string = "year";
  KPIHover: string = "off";
  constructor(private apiService: APIService) {}

  ngOnInit() {
    this.apiService.getFutureSales()
          .subscribe((data: any) => {
            this.future_sales = data;

            this.future_sales?.forEach( (elem) => {
              let year_label = elem.year.toString();
              let month_label = year_label + "-" + elem.month.toString().padStart(2, '0');
      
              if (month_label in this.monthly_future_sales) {
                this.monthly_future_sales[month_label].push([elem.pred_sales, elem.pred_profit, elem.pred_num_customers])
              }
              else {
                this.monthly_future_sales[month_label] = []
                this.monthly_future_sales[month_label].push([elem.pred_sales, elem.pred_profit, elem.pred_num_customers])
              }
            });
            var agg_fsales= Object.values(this.monthly_future_sales).map((object: any) => {
              return object.reduce((sum: any, current: any) => sum + current[0], 0);
            }) as Float32Array[];
            var agg_fprofit= Object.values(this.monthly_future_sales).map((object: any) => {
              return object.reduce((sum: any, current: any) => sum + current[1], 0);
            }) as Float32Array[];
            var agg_fnumcustomers = Object.values(this.monthly_future_sales).map((object: any) => {
              return object.reduce((sum: any, current: any) => sum + current[2], 0);
            }) as Float32Array[];

            this.future_sales_chart = new Chart("future_sales", {
              type: 'line',
              data: {
                  labels: Object.keys(this.monthly_future_sales),
                  datasets: [{
                      label: 'Forecasted Sales',
                      data: agg_fsales,
                      backgroundColor: [
                          'rgba(255, 99, 132, 0.2)',
                      ],
                      borderColor: [
                          'rgba(255, 99, 132, 1)',
                      ],
                      borderWidth: 1
                  },
                  {
                    label: 'Forecasted Profit',
                    data: agg_fprofit,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                    ],
                    borderWidth: 1
                  }]
              },
              options: {
                  plugins: {
                    title: {
                      display: true,
                      text: "Projected Sales"
                    }
                  },
                  scales: {
                      y: {
                          beginAtZero: true
                      }
                  }
              }
            });

            this.future_customer_num_chart = new Chart("future_customer_num", {
              type: 'line',
              data: {
                  labels: Object.keys(this.monthly_future_sales),
                  datasets: [{
                      label: 'New Customer Count',
                      data: agg_fnumcustomers,
                      backgroundColor: [
                          'rgba(255, 99, 132, 0.2)',
                      ],
                      borderColor: [
                          'rgba(255, 99, 132, 1)',
                      ],
                      borderWidth: 1
                  }]
              },
              options: {
                  plugins: {
                    title: {
                      display: true,
                      text: "Estimated New Customers"
                    }
                  },
                  scales: {
                      y: {
                          beginAtZero: true
                      }
                  }
              }
            });
            this.estimated_total_profit = this.future_sales?.map((row) => row.pred_profit)
                                                            .reduce((sum: any, current: any) => sum + current, 0)
            this.estimated_total_customer_count = this.future_sales?.map((row) => row.pred_num_customers)
                                                            .reduce((sum: any, current: any) => sum + current, 0);
          }); 

  }

  constructCharts() {
    this.future_sales_chart.destroy();
    this.future_customer_num_chart.destroy();
    var agg_fsales= Object.values(this.monthly_future_sales).map((object: any) => {
      return object.reduce((sum: any, current: any) => sum + current[0], 0);
    }) as Float32Array[];
    var agg_fprofit= Object.values(this.monthly_future_sales).map((object: any) => {
      return object.reduce((sum: any, current: any) => sum + current[1], 0);
    }) as Float32Array[];
    var agg_fnumcustomers = Object.values(this.monthly_future_sales).map((object: any) => {
      return object.reduce((sum: any, current: any) => sum + current[2], 0);
    }) as Float32Array[];

    this.future_sales_chart = new Chart("future_sales", {
      type: 'line',
      data: {
          labels: Object.keys(this.monthly_future_sales),
          datasets: [{
              label: 'Forecasted Sales',
              data: agg_fsales,
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
              ],
              borderWidth: 1
          },
          {
            label: 'Forecasted Profit',
            data: agg_fprofit,
            backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 1
          }]
      },
      options: {
          plugins: {
            title: {
              display: true,
              text: "Projected Sales"
            }
          },
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
    });

    this.future_customer_num_chart = new Chart("future_customer_num", {
      type: 'line',
      data: {
          labels: Object.keys(this.monthly_future_sales),
          datasets: [{
              label: 'New Customer Count',
              data: agg_fnumcustomers,
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
              ],
              borderWidth: 1
          }]
      },
      options: {
          plugins: {
            title: {
              display: true,
              text: "Estimated New Customers"
            }
          },
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
    });
  }
  changeNextYear() {
    this.monthly_future_sales = {}
    this.future_sales?.forEach( (elem) => {
      let year_label = elem.year.toString();
      let month_label = year_label + "-" + elem.month.toString().padStart(2, '0');

      if (month_label in this.monthly_future_sales) {
        this.monthly_future_sales[month_label].push([elem.pred_sales, elem.pred_profit, elem.pred_num_customers])
      }
      else {
        this.monthly_future_sales[month_label] = []
        this.monthly_future_sales[month_label].push([elem.pred_sales, elem.pred_profit, elem.pred_num_customers])
      }
    });
    this.estimated_total_profit = this.future_sales?.map((row) => row.pred_profit)
                                                            .reduce((sum: any, current: any) => sum + current, 0)
    this.estimated_total_customer_count = this.future_sales?.map((row) => row.pred_num_customers)
                                                            .reduce((sum: any, current: any) => sum + current, 0);

    this.constructCharts();
  }
  changeNextQuarter() {
    this.monthly_future_sales = {}
    var next_quarter_interval = 90;
    var data = this.future_sales?.slice(0, next_quarter_interval)
    this.estimated_total_profit = data?.map((row) => row.pred_profit)
                                                            .reduce((sum: any, current: any) => sum + current, 0)
    this.estimated_total_customer_count = data?.map((row) => row.pred_num_customers)
                                                            .reduce((sum: any, current: any) => sum + current, 0);
    data?.forEach( (elem) => {
      let year_label = elem.year.toString();
      let month_label = year_label + "-" + elem.month.toString().padStart(2, '0');

      if (month_label in this.monthly_future_sales) {
        this.monthly_future_sales[month_label].push([elem.pred_sales, elem.pred_profit, elem.pred_num_customers])
      }
      else {
        this.monthly_future_sales[month_label] = []
        this.monthly_future_sales[month_label].push([elem.pred_sales, elem.pred_profit, elem.pred_num_customers])
      }
    });

    this.constructCharts();
  }
  changeNextMonth() {
    this.monthly_future_sales = {}
    var next_month_interval = 30;
    var data = this.future_sales?.slice(0, next_month_interval)

    data?.forEach( (elem) => {
      let year_label = elem.year.toString();
      let month_label = year_label + "-" + elem.month.toString().padStart(2, '0');

      if (month_label in this.monthly_future_sales) {
        this.monthly_future_sales[month_label].push([elem.pred_sales, elem.pred_profit, elem.pred_num_customers])
      }
      else {
        this.monthly_future_sales[month_label] = []
        this.monthly_future_sales[month_label].push([elem.pred_sales, elem.pred_profit, elem.pred_num_customers])
      }
    });
    this.estimated_total_profit = data?.map((row) => row.pred_profit)
                                       .reduce((sum: any, current: any) => sum + current, 0)
    this.estimated_total_customer_count = data?.map((row) => row.pred_num_customers)
                                       .reduce((sum: any, current: any) => sum + current, 0);

    this.constructCharts();
  }

  filterEnter(status: string) {
      this.filterHover = status;
  };
  filterLeave(status: string) {
      this.filterHover = status;
  };
  KPIEnter(status: string) {
    this.KPIHover = status;
  }
  KPILeave(status: string) {
    this.KPIHover = status;
  }
}
