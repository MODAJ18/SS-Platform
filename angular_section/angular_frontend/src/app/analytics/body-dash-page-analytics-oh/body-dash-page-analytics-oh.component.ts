import { Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { orderSchema, APIService } from '../../config/config.service';
import { filterHover_allTrigger, 
         filterHover_yTrigger,
         filterHover_qTrigger, 
         filterHover_mTrigger,
         filterHover_dTrigger,
         KPIHover1_Trigger,
         KPIHover2_Trigger
         } from '../../animations';

Chart.defaults.color = "#fff";
Chart.defaults.borderColor = '#6d6875';
Chart.register(...registerables);

@Component({
  selector: 'app-body-dash-page-analytics-oh',
  templateUrl: './body-dash-page-analytics-oh.component.html',
  styleUrls: ['./body-dash-page-analytics-oh.component.css'],
  providers: [ APIService ],
  animations: [ filterHover_allTrigger,
                filterHover_yTrigger,
                filterHover_qTrigger,
                filterHover_mTrigger,
                filterHover_dTrigger,
                KPIHover1_Trigger,
                KPIHover2_Trigger
              ]
})
export class BodyDashPageAnalyticsOHComponent {
  orders: orderSchema[] | undefined;
  yearly_sales: any = {};
  quarterly_sales: any = {};
  monthly_sales: any = {};
  daily_sales: any = {};
  agg_sales: Number[] = [];;
  agg_quantity: Number[] = [];;
  agg_profit: Number[] = [];
  last_profit_total: Number = 0;
  last_quantity_total: Number = 0;
  labels: string[] = [];
  filterHover: string = "off";
  KPIHover: string = "off";
  filterStatus: string = "year";
  order_history_sales_chart: any;
  order_history_quantity_chart: any;
  constructor(private apiService: APIService) {}

  ngOnInit() {
    this.apiService.getOrderHistory()
        .subscribe((data: any) => {
          this.orders = data;
          this.orders?.forEach( (elem) => {
            let year_label = elem.year.toString();
            let quarter_label = year_label + "-Q" + elem.quarter.toString();
            let month_label = year_label + "-" + elem.month.toString().padStart(2, '0');
            let day_label = year_label + "-" + elem.day.toString();
      
            if (year_label in this.yearly_sales) {
              this.yearly_sales[year_label].push([elem.sales, elem.quantity, elem.profit])
            }
            else {
              this.yearly_sales[year_label] = []
              this.yearly_sales[year_label].push([elem.sales, elem.quantity, elem.profit])
            }
      
            if (quarter_label in this.quarterly_sales) {
              this.quarterly_sales[quarter_label].push([elem.sales, elem.quantity, elem.profit])
            }
            else {
              this.quarterly_sales[quarter_label] = []
              this.quarterly_sales[quarter_label].push([elem.sales, elem.quantity, elem.profit])
            }
      
            if (month_label in this.monthly_sales) {
              this.monthly_sales[month_label].push([elem.sales, elem.quantity, elem.profit])
            }
            else {
              this.monthly_sales[month_label] = []
              this.monthly_sales[month_label].push([elem.sales, elem.quantity, elem.profit])
            }
      
            if (day_label in this.daily_sales) {
              this.daily_sales[day_label].push([elem.sales, elem.quantity, elem.profit])
            }
            else {
              this.daily_sales[day_label] = []
              this.daily_sales[day_label].push([elem.sales, elem.quantity, elem.profit])
            }
      
          });
      
          // Default: Year Labels
          data = this.yearly_sales;
          this.labels = Object.keys(data);
          this.agg_sales = Object.values(data).map((object: any) => {
            return object.reduce((sum: any, current: any) => sum + current[0], 0);
          });
          this.agg_quantity = Object.values(data).map((object: any) => {
            return object.reduce((sum: any, current: any) => sum + current[1], 0);
          });
          this.agg_profit = Object.values(data).map((object: any) => {
            return object.reduce((sum: any, current: any) => sum + current[2], 0);
          });

          this.last_profit_total = this.agg_profit[this.agg_profit.length - 1]
          this.last_quantity_total = this.agg_quantity[this.agg_quantity.length - 1]
          
          this.order_history_sales_chart = new Chart("order_history_sales", {
            type: 'line',
            data: {
                labels: this.labels,
                datasets: [{
                    label: 'Sales',
                    data: this.agg_sales,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 1
                },
                {
                  label: 'Profit',
                  data: this.agg_profit,
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
                    text: "Order History - Sales and Profit"
                  }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
          });
      
          this.order_history_quantity_chart = new Chart("order_history_quantity", {
            type: 'line',
            data: {
                labels: this.labels,
                datasets: [{
                    label: 'Quantities Sold',
                    data: this.agg_quantity,
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
                    text: "Order History - Quantity"
                  }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
          });
        }); 
  }

  reconstructCharts(data: any) {
    this.agg_sales = Object.values(data).map((object: any) => {
      return object.reduce((sum: any, current: any) => sum + current[0], 0);
    });
    this.agg_quantity = Object.values(data).map((object: any) => {
      return object.reduce((sum: any, current: any) => sum + current[1], 0);
    });
    this.agg_profit = Object.values(data).map((object: any) => {
      return object.reduce((sum: any, current: any) => sum + current[2], 0);
    });
    this.order_history_sales_chart.destroy();
    this.order_history_quantity_chart.destroy();

    this.order_history_sales_chart = new Chart("order_history_sales", {
      type: 'line',
      data: {
          labels: this.labels,
          datasets: [{
              label: 'Sales',
              data: this.agg_sales,
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
              ],
              borderWidth: 1
          },
          {
            label: 'Profit',
            data: this.agg_profit,
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
              text: "Order History - Sales and Profit"
            }
          },
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
    });

    this.order_history_quantity_chart = new Chart("order_history_quantity", {
      type: 'line',
      data: {
          labels: this.labels,
          datasets: [{
              label: 'Quantities Sold',
              data: this.agg_quantity,
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
              text: "Order History - Quantity"
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

  changeByYear() {
    var data = this.yearly_sales;
    this.labels = Object.keys(data);
    this.reconstructCharts(data);
  }
  changeByQuarter() {
    var data = this.quarterly_sales;
    this.labels = Object.keys(data);
    this.reconstructCharts(data);
  }
  changeByMonth() {
    var data = this.monthly_sales;
    this.labels = Object.keys(data);
    this.reconstructCharts(data);
  }
  changeByDay() {
    var data = this.daily_sales;
    this.labels = Object.keys(data);
    this.reconstructCharts(data);
  }



  filterEnter(status: string) {
    this.filterHover = status;
  }
  filterLeave(status: string) {
    this.filterHover = status;
  }
  KPIEnter(status: string) {
    this.KPIHover = status;
  }
  KPILeave(status: string) {
    this.KPIHover = status;
  }
}
