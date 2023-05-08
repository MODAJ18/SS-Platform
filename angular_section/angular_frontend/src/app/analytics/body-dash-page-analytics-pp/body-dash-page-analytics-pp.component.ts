import { Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { productPerformanceSchema, APIService, customerPreferenceSalesSchema } from '../../config/config.service';
import { filterHover_allTrigger, 
         filterHover_yTrigger,
         filterHover_qTrigger, 
         filterHover_mTrigger
        } from '../../animations';

Chart.defaults.color = "#fff";
Chart.defaults.borderColor = '#011926';
Chart.register(...registerables);

@Component({
  selector: 'app-body-dash-page-analytics-pp',
  templateUrl: './body-dash-page-analytics-pp.component.html',
  styleUrls: ['./body-dash-page-analytics-pp.component.css'],
  providers: [ APIService ],
  animations: [ filterHover_allTrigger,
                filterHover_yTrigger,
                filterHover_qTrigger,
                filterHover_mTrigger
              ]
})
export class BodyDashPageAnalyticsPpComponent {
    product_sales: productPerformanceSchema[] | undefined;
    product_category_sales: customerPreferenceSalesSchema[] | undefined;
    products: any = {};
    product_categories: any = {};
    top5_products: any = {};
    top5_product_categories: any = {};

    pp_top5products_chart: any;
    pp_top5productcategories_chart: any;
    filterHover: string = "off";
    filterStatus: string = "all";
    constructor(private apiService: APIService) {}

    ngOnInit() {
        this.apiService.getProductPerformance()
                  .subscribe((data: any) => {
                    this.product_sales = data;
                    this.product_sales?.forEach( (elem) => {
                        let product_label = elem.product_name.toString();
                
                        if (product_label in this.products) {
                          this.products[product_label].push([elem.overall_profit])
                        }
                        else {
                          this.products[product_label] = []
                          this.products[product_label].push([elem.overall_profit])
                        }

                        var agg_profit_products = Object.values(this.products).map((object: any) => {
                            return object.reduce((sum: any, current: any) => sum + current[0], 0);
                        }) as Float32Array[];
                        this.top5_products = [...agg_profit_products].sort((a, b) => (a > b ? -1 : 1)).slice(0, 5).map((val: any) => {
                            let idx_top5_i = agg_profit_products.indexOf(val);
                            return [Object.keys(this.products)[idx_top5_i], agg_profit_products[idx_top5_i]];
                        });
                    }); 
                    this.pp_top5products_chart = new Chart("pp_top5products", {
                        type: 'bar',
                        // type: 'line',
                        data: {
                            labels: this.top5_products.map((elem:any) => elem[0]),
                            datasets: [{
                                label: 'Profit',
                                data: this.top5_products.map((elem:any) => elem[1]),
                                backgroundColor: [
                                    'rgba(54, 162, 235, 0.2)',
                                ],
                                borderColor: [
                                    'rgba(54, 162, 235, 1)',
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            plugins: {
                                title: {
                                  display: true,
                                  text: "Product Perfomance - Top 5 Products by Profit"
                                }
                            },
                            indexAxis: 'y',
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                    // console.log(this.top5_products);
        }); 

        this.apiService.getCustomerPreferenceSales()
                  .subscribe((data: any) => {
                    this.product_category_sales = data;
                    // console.log(this.product_category_sales)
                    this.product_category_sales?.forEach( (elem) => {
                        let product_category_label = elem.category.toString();
                
                        if (product_category_label in this.product_categories) {
                          this.product_categories[product_category_label].push([+elem.num_customers])
                        }
                        else {
                          this.product_categories[product_category_label] = []
                          this.product_categories[product_category_label].push([+elem.num_customers])
                        }

                        var agg_customer_num_products = Object.values(this.product_categories).map((object: any) => {
                            return object.reduce((sum: any, current: any) => sum + current[0], 0);
                        }) as Float32Array[];
                        this.top5_product_categories = [...agg_customer_num_products].sort((a, b) => (a > b ? -1 : 1)).slice(0, 5).map((val: any) => {
                            let idx_top5_i = agg_customer_num_products.indexOf(val);
                            return [Object.keys(this.product_categories)[idx_top5_i], agg_customer_num_products[idx_top5_i]];
                        });
                    }); 
                    this.pp_top5productcategories_chart = new Chart("pp_productCategories", {
                        type: 'bar',
                        // type: 'line',
                        data: {
                            labels: this.top5_product_categories.map((elem:any) => elem[0]),
                            datasets: [{
                                label: '# Customers',
                                data: this.top5_product_categories.map((elem:any) => elem[1]),
                                backgroundColor: [
                                    'rgba(248, 64, 46, 0.2)',
                                ],
                                borderColor: [
                                    'rgba(248, 64, 46 , 1)',
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            plugins: {
                                title: {
                                  display: true,
                                  text: "Product Perfomance - Product Category Numbers"
                                }
                            },
                            indexAxis: 'y',
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });

                    // console.log(this.top5_product_categories)
                  }); 
    };

    construct_charts() {
        this.pp_top5products_chart.destroy();
        this.pp_top5productcategories_chart.destroy();
        
        var agg_profit_products = Object.values(this.products).map((object: any) => {
            return object.reduce((sum: any, current: any) => sum + current[0], 0);
        }) as Float32Array[];
        this.top5_products = [...agg_profit_products].sort((a, b) => (a > b ? -1 : 1)).slice(0, 5).map((val: any) => {
            let idx_top5_i = agg_profit_products.indexOf(val);
            return [Object.keys(this.products)[idx_top5_i], agg_profit_products[idx_top5_i]];
        });

        var agg_customer_num_products = Object.values(this.product_categories).map((object: any) => {
            return object.reduce((sum: any, current: any) => sum + current[0], 0);
        }) as Float32Array[];
        this.top5_product_categories = [...agg_customer_num_products].sort((a, b) => (a > b ? -1 : 1)).slice(0, 5).map((val: any) => {
            let idx_top5_i = agg_customer_num_products.indexOf(val);
            return [Object.keys(this.product_categories)[idx_top5_i], agg_customer_num_products[idx_top5_i]];
        });

        this.pp_top5products_chart = new Chart("pp_top5products", {
            type: 'bar',
            // type: 'line',
            data: {
                labels: this.top5_products.map((elem:any) => elem[0]),
                datasets: [{
                    label: 'Profit',
                    data: this.top5_products.map((elem:any) => elem[1]),
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: {
                      display: true,
                      text: "Product Perfomance - Top 5 Products by Profit"
                    }
                },
                indexAxis: 'y',
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        this.pp_top5productcategories_chart = new Chart("pp_productCategories", {
            type: 'bar',
            // type: 'line',
            data: {
                labels: this.top5_product_categories.map((elem:any) => elem[0]),
                datasets: [{
                    label: '# Customers',
                    data: this.top5_product_categories.map((elem:any) => elem[1]),
                    backgroundColor: [
                        'rgba(248, 64, 46, 0.2)',
                    ],
                    borderColor: [
                        'rgba(248, 64, 46 , 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    title: {
                      display: true,
                      text: "Product Perfomance - Product Category Numbers"
                    }
                },
                indexAxis: 'y',
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };
    changeAll() {
        this.products = {};
        this.product_categories = {};
        this.product_sales?.forEach( (elem) => {
            let product_label = elem.product_name.toString();
    
            if (product_label in this.products) {
              this.products[product_label].push([elem.overall_profit])
            }
            else {
              this.products[product_label] = []
              this.products[product_label].push([elem.overall_profit])
            }
        }); 

        this.product_category_sales?.forEach( (elem) => {
            let product_category_label = elem.category.toString();
    
            if (product_category_label in this.product_categories) {
              this.product_categories[product_category_label].push([+elem.num_customers])
            }
            else {
              this.product_categories[product_category_label] = []
              this.product_categories[product_category_label].push([+elem.num_customers])
            }
        }); 
        this.construct_charts();
    };
    changeByYear() {
        const currentYear  = (new Date().getFullYear()).toString();
        this.products = {};
        this.product_categories = {};

        this.product_sales?.forEach( (elem) => {
            let product_label = elem.product_name.toString();
            if (elem.year == currentYear) {
                if (product_label in this.products) {
                this.products[product_label].push([elem.overall_profit])
                }
                else {
                this.products[product_label] = []
                this.products[product_label].push([elem.overall_profit])
                }
            }
        }); 

        this.product_category_sales?.forEach( (elem) => {
            let product_category_label = elem.category.toString();
            if (elem.year == currentYear) {
                if (product_category_label in this.product_categories) {
                this.product_categories[product_category_label].push([+elem.num_customers])
                }
                else {
                this.product_categories[product_category_label] = []
                this.product_categories[product_category_label].push([+elem.num_customers])
                }
            }
        }); 
        this.construct_charts();
    };
    changeByQuarter() {
        const currentDate = new Date();
        const currentQuarter = (Math.floor((currentDate.getMonth() + 3) / 3)).toString();
        const currentYear  = (currentDate.getFullYear()).toString();
        this.products = {};
        this.product_categories = {};

        this.product_sales?.forEach( (elem) => {
            let product_label = elem.product_name.toString();
            if ((elem.year==currentYear) && (elem.quarter == currentQuarter)) {
                if (product_label in this.products) {
                this.products[product_label].push([elem.overall_profit])
                }
                else {
                this.products[product_label] = []
                this.products[product_label].push([elem.overall_profit])
                }
            }
        }); 

        this.product_category_sales?.forEach( (elem) => {
            let product_category_label = elem.category.toString();
            if ((elem.year==currentYear) && (elem.quarter == currentQuarter)) {
                if (product_category_label in this.product_categories) {
                this.product_categories[product_category_label].push([+elem.num_customers])
                }
                else {
                this.product_categories[product_category_label] = []
                this.product_categories[product_category_label].push([+elem.num_customers])
                }
            }
        }); 

        this.construct_charts();
    };
    changeByMonth() {
        const currentDate = new Date();
        const currentMonth  = (currentDate.getMonth() + 1).toString();
        const currentYear  = (currentDate.getFullYear()).toString();
        this.products = {};
        this.product_categories = {};

        this.product_sales?.forEach( (elem) => {
            let product_label = elem.product_name.toString();
            if ((elem.year==currentYear) && (elem.month == currentMonth)) {
                if (product_label in this.products) {
                this.products[product_label].push([elem.overall_profit])
                }
                else {
                this.products[product_label] = []
                this.products[product_label].push([elem.overall_profit])
                }
            }
        }); 

        this.product_category_sales?.forEach( (elem) => {
            let product_category_label = elem.category.toString();
            if ((elem.year==currentYear) && (elem.month == currentMonth)) {
                if (product_category_label in this.product_categories) {
                this.product_categories[product_category_label].push([+elem.num_customers])
                }
                else {
                this.product_categories[product_category_label] = []
                this.product_categories[product_category_label].push([+elem.num_customers])
                }
            }
        }); 

        this.construct_charts();
    };

    filterEnter(status: string) {
        this.filterHover = status;
    };
    filterLeave(status: string) {
        this.filterHover = status;
    };


}
