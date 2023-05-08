import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { branchSalesSchema, APIService } from '../../config/config.service';
import { filterHover_allTrigger, 
         filterHover_yTrigger,
         filterHover_qTrigger, 
         filterHover_mTrigger
        } from '../../animations';

// import {MatTableModule} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {MatSort, Sort} from '@angular/material/sort';


Chart.defaults.color = "#fff";
Chart.defaults.borderColor = '#011926';
Chart.register(...registerables);

@Component({
  selector: 'app-body-dash-page-analytics-bs',
  templateUrl: './body-dash-page-analytics-bs.component.html',
  styleUrls: ['./body-dash-page-analytics-bs.component.css'],
  providers: [ APIService ],
  animations: [ filterHover_allTrigger,
                filterHover_yTrigger,
                filterHover_qTrigger,
                filterHover_mTrigger
              ]
  })
export class BodyDashPageAnalyticsBSComponent implements AfterViewInit, OnInit {
    branch_sales: branchSalesSchema[] = [];
    branches: any = {};
    cities: any = {};
    top5_branches: any = {};
    top5_cities: any = {};

    // table
    // displayedColumns: string[] = ["l_row_id", "region", "country", "city", 
    //                                     "year", "quarter", "month", "day", 
    //                                     "overall_profit", "overall_sales", "quantity_total"];
    displayedColumns: string[] = ["branch_id", "region", "country", "city", 
                                  "year", "quarter", "month", "day", 
                                  "overall_profit", "overall_sales", "quantity_total"];
    dataSource = new MatTableDataSource<branchSalesSchema>();

    // charts
    bs_top5branches_chart: any;
    bs_top5cities_chart: any;

    // filters
    filterHover: string = "off";
    filterStatus: string = "all";
    constructor(private apiService: APIService, private _liveAnnouncer: LiveAnnouncer) {}

    // table
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }
    /** Announce the change in sort state for assistive technology. */
    announceSortChange(sortState: Sort) {
        if (sortState.direction) {
        this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
        } else {
        this._liveAnnouncer.announce('Sorting cleared');
        }
    }

    ngOnInit() {
    this.apiService.getBranchSales()
        .subscribe((data: any) => {
                    this.branch_sales = data;
                    this.dataSource.data  = this.branch_sales;
                    var tableDataSource = [];
                    
                    this.branch_sales.forEach( (elem) => {
                        let branch_id_label = elem.l_row_id.toString();

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
                    // console.log("top 5 branches: " + this.top5_branches.map((elem:any) => elem[0]))
                    // console.log("top 5 branches (profit): " + this.top5_branches.map((elem:any) => elem[1]))
                    // console.log("top 5 branches (sales): " + this.top5_branches.map((elem:any) => elem[2]))
                    // console.log("top 5 branches (quantity): " + this.top5_branches.map((elem:any) => elem[3]))

                    this.bs_top5branches_chart = new Chart("bs_top5branches", {
                        type: 'bar',
                        data: {
                            labels: this.top5_branches.map((elem:any) => elem[0]),
                            datasets: [{
                                label: 'Profit',
                                data: this.top5_branches.map((elem:any) => elem[1]),
                                backgroundColor: [
                                    'rgba(54, 162, 235, 0.2)',
                                ],
                                borderColor: [
                                    'rgba(54, 162, 235, 1)',
                                ],
                                borderWidth: 1
                            },
                            {
                                label: 'Sales',
                                data: this.top5_branches.map((elem:any) => elem[2]),
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 1)',
                                ],
                                borderWidth: 1
                            },
                            {
                                label: 'Quantity',
                                data: this.top5_branches.map((elem:any) => elem[3]),
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
                                  text: "Branch Sales - Top 5 Branches"
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

                    this.bs_top5cities_chart = new Chart("bs_top5cities", {
                        type: 'bar',
                        data: {
                            labels: this.top5_cities.map((elem:any) => elem[0]),
                            datasets: [{
                                label: 'Profit',
                                data: this.top5_cities.map((elem:any) => elem[1]),
                                backgroundColor: [
                                    'rgba(54, 162, 235, 0.2)',
                                ],
                                borderColor: [
                                    'rgba(54, 162, 235, 1)',
                                ],
                                borderWidth: 1
                            },
                            {
                                label: 'Sales',
                                data: this.top5_cities.map((elem:any) => elem[2]),
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 1)',
                                ],
                                borderWidth: 1
                            },
                            {
                                label: 'Quantity',
                                data: this.top5_cities.map((elem:any) => elem[3]),
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
                                  text: "Branch Sales - Top 5 Cities"
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

                    }); 

    };

    construct_charts() {
        this.bs_top5branches_chart.destroy()
        this.bs_top5cities_chart.destroy()
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
        this.bs_top5branches_chart = new Chart("bs_top5branches", {
            type: 'bar',
            data: {
                labels: this.top5_branches.map((elem:any) => elem[0]),
                datasets: [{
                    label: 'Profit',
                    data: this.top5_branches.map((elem:any) => elem[1]),
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                    ],
                    borderWidth: 1
                },
                {
                    label: 'Sales',
                    data: this.top5_branches.map((elem:any) => elem[2]),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 1
                },
                {
                    label: 'Quantity',
                    data: this.top5_branches.map((elem:any) => elem[3]),
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
                    text: "Branch Sales - Top 5 Branches"
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
        this.bs_top5cities_chart = new Chart("bs_top5cities", {
            type: 'bar',
            data: {
                labels: this.top5_cities.map((elem:any) => elem[0]),
                datasets: [{
                    label: 'Profit',
                    data: this.top5_cities.map((elem:any) => elem[1]),
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                    ],
                    borderWidth: 1
                },
                {
                    label: 'Sales',
                    data: this.top5_cities.map((elem:any) => elem[2]),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 1
                },
                {
                    label: 'Quantity',
                    data: this.top5_cities.map((elem:any) => elem[3]),
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
                    text: "Branch Sales - Top 5 Cities"
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
        this.branches = {}
        this.cities = {}
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
        this.construct_charts();

    };
    changeByYear() {
        const currentYear  = (new Date().getFullYear()).toString();
        this.branches = {}
        this.cities = {}
        this.branch_sales?.forEach( (elem) => {
            let branch_label = elem.l_row_id.toString();
            let city_label = elem.city.toString();
            if (elem.year == currentYear) {
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
        this.construct_charts();
    };
    changeByQuarter() {
        const currentDate = new Date();
        const currentQuarter = (Math.floor((currentDate.getMonth() + 3) / 3)).toString();
        const currentYear  = (currentDate.getFullYear()).toString();
        this.branches = {}
        this.cities = {}
        this.branch_sales?.forEach( (elem) => {
            let branch_label = elem.l_row_id.toString();
            let city_label = elem.city.toString();
            if ((elem.year == currentYear) && (elem.quarter == currentQuarter)) {
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
        this.construct_charts();

    };
    changeByMonth() {
        const currentDate = new Date();
        const currentMonth  = (currentDate.getMonth() + 1).toString();
        const currentYear  = (currentDate.getFullYear()).toString();
        this.branches = {}
        this.cities = {}
        this.branch_sales?.forEach( (elem) => {
            let branch_label = elem.l_row_id.toString();
            let city_label = elem.city.toString();
            if ((elem.year == currentYear) && (elem.month == currentMonth)) {
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
        this.construct_charts();

    };

    filterEnter(status: string) {
        this.filterHover = status;
    };
    filterLeave(status: string) {
        this.filterHover = status;
    };
}
