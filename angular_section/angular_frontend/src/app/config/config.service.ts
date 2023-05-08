import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HttpErrorResponse  } from '@angular/common/http';

export interface orderSchema {
  category: String;
  sub_category: String;
  year: String;
  quarter: String;
  month: String;
  day: String;
  sales: Number;
  quantity: Number; 
  profit: Number;
}

export interface branchSalesSchema {
  l_row_id: String,
  region: String,
  country: String,
  city: String,
  year: String,
  quarter: String,
  month: String,
  day: String,
  overall_profit: Number,
  overall_sales: Number,
  quantity_total: Number
}

export interface customerPreferenceSalesSchema {
  category: String,
  sub_category: String,
  year: String,
  quarter: String,
  month: String,
  day: String,
  num_customers: Number,
  overall_profit: Number,
  overall_sales: Number,
  quantity_total: Number
}

export interface productPerformanceSchema {
  row_id: String,
  product_name: String,
  category: String,
  sub_category: String,
  year: String,
  quarter: String,
  month: String,
  day: String,
  overall_sales: Number,
  overall_profit: Number,
  product_price: Number,
  product_rating: Number,
  quantity_total: Number,
  review_perception: Number, 
  sentiment_score: Number
}

export interface futureSalesSchema {
  year: String,
  quarter: String,
  month: String,
  day: String,
  pred_num_customers: Number,
  pred_sales: Number,
  pred_profit: Number
}

@Injectable()
export class APIService {

  endpointUrl = 'http://localhost:3080/api/';
  constructor(private http: HttpClient) { }

  getOrderHistory() {
    return this.http.get<orderSchema>(this.endpointUrl + "orders")
        .pipe(
            retry(3), // retry a failed request up to 3 times
            catchError(this.handleError) // then handle the error
      );
  }
  getBranchSales() {
    return this.http.get<branchSalesSchema>(this.endpointUrl + "branch_sales")
        .pipe(
            retry(3),
            catchError(this.handleError)
        )
  }
  getCustomerPreferenceSales() {
    return this.http.get<customerPreferenceSalesSchema>(this.endpointUrl + "customer_preference_sales")
        .pipe(
            retry(3),
            catchError(this.handleError)
        )
  }
  getProductPerformance() {
    return this.http.get<productPerformanceSchema>(this.endpointUrl + "product_performance")
        .pipe(
            retry(3),
            catchError(this.handleError)
        )
  }
  getFutureSales() {
    return this.http.get<productPerformanceSchema>(this.endpointUrl + "future_sales")
        .pipe(
            retry(3),
            catchError(this.handleError)
        )
  }
  

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}