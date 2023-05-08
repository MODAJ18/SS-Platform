import { Component } from '@angular/core';
import { orderSchema, 
         branchSalesSchema, 
         customerPreferenceSalesSchema, 
         productPerformanceSchema,
         futureSalesSchema,
         APIService } from './config.service';

@Component({
    selector: 'app-config',
    templateUrl: './config.component.html',
    providers: [ APIService ],
    styles: ['.error { color: #b30000; }']
  })
  export class ConfigComponent {
    error: any;
    headers: string[] = [];
    orders: orderSchema[] | undefined;
    yearly_sales: any = {};
    quarterly_sales: any = {};
    monthly_sales: any = {};
    daily_sales: any = {};

    branch_sales: branchSalesSchema[] | undefined;
    branches: any = {};
    cities: any = {};
    top5_branches: any = {};
    top5_cities: any = {};

    product_sales: productPerformanceSchema[] | undefined;
    products: any = {};
    product_categories: any = {};
    top5_products: any = {};
    top5_product_categories: any = {};
    customer_preference_sales: customerPreferenceSalesSchema[] | undefined;
    product_performance: productPerformanceSchema[] | undefined;
    
    future_sales: futureSalesSchema[] | undefined;
    monthly_future_sales: any = {};
    constructor(private apiService: APIService) {}
    

    ngOnInit() {
      this.apiService.getOrderHistory()
        .subscribe((data: any) => {
                    this.orders = data;
                    console.log("API: Order History")
                    // console.log(this.orders);
                  });
      this.apiService.getBranchSales()
        .subscribe((data: any) => {
                    this.branch_sales = data;
                    console.log("API: Branch Sales")
                  }); 
      this.apiService.getCustomerPreferenceSales()
        .subscribe((data: any) => {
                    this.customer_preference_sales = data;
                    console.log("API: Customer Preference Sales"); 
                  }); 
      this.apiService.getProductPerformance()
                  .subscribe((data: any) => {
                    this.product_performance = data;
                    console.log("API: Product Performance"); 
                  }); 
      this.apiService.getFutureSales()
                  .subscribe((data: any) => {
                    this.future_sales = data;
                    console.log("API: Future Sales"); 
                  }); 
    }


    clear() {
    }
    // showConfig() {
    //   this.configService.getConfig()
    //     .subscribe({
    //       next: (data: Config) => this.config = { ...data }, // success path
    //       error: error => this.error = error, // error path
    //     });
    // }
    // yearly_labels = [];
    // quarterly_labels = [];
    // monthly_labels = [];
    // daily_labels = [];
    // yearly_sales = [];

    res: any = [];
    res2: any = [];
    getOrderHistoryData() {

        console.log(this.orders)
        var current_date = new Date();
        // current_date.setMonth(current_date.getMonth()+1);
        const currentYear  = current_date.getFullYear();
        const currentMonth  = current_date.getMonth() + 1;
        const currentQuarter = Math.floor((current_date.getMonth() + 3) / 3);
        var start_year_date = new Date(current_date.getFullYear(), 0, 0);
        var diff = (current_date.getTime() - start_year_date.getTime()) + ((start_year_date.getTimezoneOffset() - current_date.getTimezoneOffset()) * 60 * 1000);
        const currentDay = Math.floor(diff / (1000 * 60 * 60 * 24));
        // console.log(currentYear)
        // console.log(currentMonth)
        // console.log(currentQuarter)
        // console.log(currentDay)


        // MAP TO ARRAY
        this.res = this.orders?.map((order) => {
          return order.sales
        });


        // GROUP BY
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
        // console.log(this.yearly_sales)
        // console.log(this.quarterly_sales)
        // console.log(this.monthly_sales)
        // console.log(this.daily_sales)
        // console.log(Object.keys(this.yearly_sales) );
        // console.log(Object.values(this.yearly_sales) );
        
        var agg_sales, agg_quantity, agg_profit;
        var data = this.yearly_sales;
        agg_sales = Object.values(data).map((object: any) => {
          return object.reduce((sum: any, current: any) => sum + current[0], 0);
        }) as Float32Array[];
        agg_quantity = Object.values(data).map((object: any) => {
          return object.reduce((sum: any, current: any) => sum + current[1], 0);
        }) as Float32Array[];agg_profit = Object.values(data).map((object: any) => {
          return object.reduce((sum: any, current: any) => sum + current[2], 0);
        }) as Float32Array[];
        
        // console.log(agg_sales);
        // console.log(agg_quantity);
        // console.log(agg_profit);

        // FILTER
        var filteredOrders_last_year = this.orders?.filter((obj) => {
          return obj.year == currentYear.toString();
        });
        var filteredOrders_last_quarter = this.orders?.filter((obj) => {
          return obj.quarter == currentQuarter.toString() && obj.year == currentYear.toString();
        });
        var filteredOrders_last_month = this.orders?.filter((obj) => {
          return obj.month == currentMonth.toString() && obj.year == currentYear.toString();
        });
        // console.log(filteredOrders_last_year)
        // console.log(filteredOrders_last_quarter)
        // console.log(filteredOrders_last_month)

        
    }

    getBranchSalesData() {
      var current_date = new Date();
      const currentYear  = (current_date.getFullYear()).toString();
      const currentMonth  = (current_date.getMonth() + 1).toString();
      const currentQuarter = (Math.floor((current_date.getMonth() + 3) / 3)).toString();

      // get first 5 by slice
      console.log(this.branch_sales?.slice(0, 5))

      // GROUP BY
      this.branch_sales?.forEach( (elem) => {
        let branch_label = elem.l_row_id.toString();
        let city_label = elem.city.toString();

        if (branch_label in this.branches) {
          this.branches[branch_label].push([elem.overall_sales, elem.quantity_total, elem.overall_profit])
        }
        else {
          this.branches[branch_label] = []
          this.branches[branch_label].push([elem.overall_sales, elem.quantity_total, elem.overall_profit])
        }

        if (city_label in this.cities) {
          this.cities[city_label].push([elem.overall_sales, elem.quantity_total, elem.overall_profit])
        }
        else {
          this.cities[city_label] = []
          this.cities[city_label].push([elem.overall_sales, elem.quantity_total, elem.overall_profit])
        }

      });
      console.log(this.branches)
      console.log(this.cities)

      var agg_sales_branches = Object.values(this.branches).map((object: any) => {
        return object.reduce((sum: any, current: any) => sum + current[0], 0);
      }) as Float32Array[];
      var agg_quantity_branches = Object.values(this.branches).map((object: any) => {
        return object.reduce((sum: any, current: any) => sum + current[1], 0);
      }) as Float32Array[];
      var agg_profit_branches = Object.values(this.branches).map((object: any) => {
        return object.reduce((sum: any, current: any) => sum + current[2], 0);
      }) as Float32Array[];
      this.top5_branches = [...agg_profit_branches].sort((a, b) => (a > b ? -1 : 1)).slice(0, 5).map((val: any) => {
        let idx_top5_i = agg_profit_branches.indexOf(val);
        return [Object.keys(this.branches)[idx_top5_i], val, agg_sales_branches[idx_top5_i], agg_quantity_branches[idx_top5_i]];
      });

      var agg_sales_cities = Object.values(this.cities).map((object: any) => {
        return object.reduce((sum: any, current: any) => sum + current[0], 0);
      }) as Float32Array[];
      var agg_quantity_cities = Object.values(this.cities).map((object: any) => {
        return object.reduce((sum: any, current: any) => sum + current[1], 0);
      }) as Float32Array[];
      var agg_profit_cities = Object.values(this.cities).map((object: any) => {
        return object.reduce((sum: any, current: any) => sum + current[2], 0);
      }) as Float32Array[];
      this.top5_cities = [...agg_profit_cities].sort((a, b) => (a > b ? -1 : 1)).slice(0, 5).map((val: any) => {
        let idx_top5_i = agg_profit_cities.indexOf(val);
        return [Object.keys(this.cities)[idx_top5_i], val,  agg_sales_cities[idx_top5_i], agg_quantity_cities[idx_top5_i]];
      });
      // console.log(Object.keys(this.branches))
      // console.log(agg_profit_branches)
      console.log(this.top5_branches)
      console.log("top 5 branches: " + this.top5_branches.map((elem:any) => elem[0]))
      console.log("top 5 branches (profit): " + this.top5_branches.map((elem:any) => elem[1]))
      console.log("top 5 branches (sales): " + this.top5_branches.map((elem:any) => elem[2]))
      console.log("top 5 branches (quantity): " + this.top5_branches.map((elem:any) => elem[3]))
      console.log("top 5 cities: " + this.top5_cities.map((elem:any) => elem[0]))
      console.log("top 5 cities (profit): " + this.top5_cities.map((elem:any) => elem[1]))
      console.log("top 5 cities (sales): " + this.top5_cities.map((elem:any) => elem[2]))
      console.log("top 5 cities (quantity): " + this.top5_cities.map((elem:any) => elem[3]))
      // console.log(this.top5_cities.map((elem:any) => elem))

      // get last year data
      this.branches = {}
      this.cities = {}
      this.branch_sales?.forEach( (elem) => {
        let branch_label = elem.l_row_id.toString();
        let city_label = elem.city.toString();
        if (elem.year == "2014") {
          if (branch_label in this.branches) {
            this.branches[branch_label].push([elem.overall_sales, elem.quantity_total, elem.overall_profit, elem.year])
          }
          else {
            this.branches[branch_label] = []
            this.branches[branch_label].push([elem.overall_sales, elem.quantity_total, elem.overall_profit, elem.year])
          }
  
          if (city_label in this.cities) {
            this.cities[city_label].push([elem.overall_sales, elem.quantity_total, elem.overall_profit, elem.year])
          }
          else {
            this.cities[city_label] = []
            this.cities[city_label].push([elem.overall_sales, elem.quantity_total, elem.overall_profit, elem.year])
          }
        }
      });
      // console.log(this.branches)


      // bottom 5
      // console.log(this.branch_sales?.sort((a, b) => (a.overall_profit < b.overall_profit ? -1 : 1)))
      // top 5
      // console.log(this.branch_sales?.sort((a, b) => (a.overall_profit > b.overall_profit ? -1 : 1)))

  
    }
    getCustomerPreferenceSalesData() {
      console.log(this.customer_preference_sales)
    }
    getProductPerformanceData() {
      console.log(this.product_performance)
    }
    getFutureSalesData() {
      var next_quarter_interval = 90;
      var next_month_interval = 30;

      console.log(this.future_sales);
      console.log("Sales forecasted day-by-day: ")
      console.log(this.future_sales?.map((row) => row.year+"-"+row.day))
      console.log(this.future_sales?.map((row) => row.pred_sales))
      console.log(this.future_sales?.map((row) => row.pred_profit))
      console.log(this.future_sales?.map((row) => row.pred_num_customers))
      console.log("estimated customer count: " + this.future_sales?.map((row) => row.pred_num_customers).reduce((sum: any, current: any) => sum + current, 0))
      console.log("estimated profit: " + this.future_sales?.map((row) => row.pred_profit).reduce((sum: any, current: any) => sum + current, 0))
      console.log("Sales forecasted day-by-day (next quarter): ")
      console.log(this.future_sales?.map((row) => row.year+"-"+row.day).slice(0, next_quarter_interval))
      console.log("Sales forecasted day-by-day (next month): ")
      console.log(this.future_sales?.map((row) => row.year+"-"+row.day).slice(0, next_month_interval))
      // GROUP BY
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
      console.log("Sales forecasted month-by-month: ")
      var agg_fsales= Object.values(this.monthly_future_sales).map((object: any) => {
        return object.reduce((sum: any, current: any) => sum + current[0], 0);
      }) as Float32Array[];
      var agg_fprofit= Object.values(this.monthly_future_sales).map((object: any) => {
        return object.reduce((sum: any, current: any) => sum + current[1], 0);
      }) as Float32Array[];
      var agg_fnumcustomers = Object.values(this.monthly_future_sales).map((object: any) => {
        return object.reduce((sum: any, current: any) => sum + current[2], 0);
      }) as Float32Array[];

      console.log(Object.keys(this.monthly_future_sales))
      console.log(agg_fsales)
      console.log(agg_fprofit)
      console.log(agg_fnumcustomers)
    }
  }