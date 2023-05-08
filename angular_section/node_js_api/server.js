// const http = require('http')
var assert = require('assert')
const express = require('express');
const cors = require('cors');
const app = express(),
      bodyParser = require("body-parser");


app.use(bodyParser.json());
app.use(cors({
    origin: true, // "true" will copy the domain of the request back
                  // to the reply. If you need more control than this
                  // use a function.

    credentials: true, // This MUST be "true" if your endpoint is
                       // authenticated via either a session cookie
                       // or Authorization header. Otherwise the
                       // browser will block the response.

    methods: 'GET' // Make sure you're not blocking
                                           // pre-flight OPTIONS requests
}));


const hostname = '127.0.0.1'
const port = 3080;
const cassandra = require('cassandra-driver');
const client = new cassandra.Client({ contactPoints: [hostname], 
                                      localDataCenter: 'datacenter1', 
                                      keyspace: 'sales_serving_layer' });
var params; 
     

// Accessing Database
var timely_orders_result = [];
const timely_orders_query = 'SELECT category, sub_category, year, quarter, month, day, sum(sales)as sales,' +
 'sum(quantity) as quantity, sum(profit) as profit FROM timely_orders group by category, sub_category, year, quarter, month, day;'
params = []; 
(async() => {
    result = await client.execute(timely_orders_query, params, { prepare: true });
    for await (const row of result) {
        timely_orders_result.push(row);
    }
})();

var branch_sales_result = [];
const branch_sales_query = 'select * from branch_sales;'
params = []; 
(async() => {
    result = await client.execute(branch_sales_query, params, { prepare: true });
    for await (const row of result) {
        branch_sales_result.push(row);
    }
})();

var customer_preference_sales_result = [];
const customer_preference_sales_query = 'select * from customer_preference_sales;';
params = []; 
(async() => {
    result = await client.execute(customer_preference_sales_query, params, { prepare: true });
    for await (const row of result) {
        customer_preference_sales_result.push(row);
    }
})();

var product_performance_result = [];
const product_performance_query = 'select * from product_performance;';
params = []; 
(async() => {
    result = await client.execute(product_performance_query, params, { prepare: true });
    for await (const row of result) {
        product_performance_result.push(row);
    }
})();

var future_sales_result = [];
const future_sales_query = 'select * from future_sales;';
params = []; 
(async() => {
    result = await client.execute(future_sales_query, params, { prepare: true });
    for await (const row of result) {
        future_sales_result.push(row);
    }
})();


// Endpoints
app.get('/', (req,res) => {
    res.send('App Works !!!!');
});
app.get('/api/orders', (req, res) => {
    res.json(timely_orders_result);
});
app.get('/api/branch_sales', (req, res) => {
    res.json(branch_sales_result);
});
app.get('/api/customer_preference_sales', (req, res) => {
    res.json(customer_preference_sales_result);
});
app.get('/api/product_performance', (req, res) => {
    res.json(product_performance_result);
});
app.get('/api/future_sales', (req, res) => {
    res.json(future_sales_result);
});


app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});

// const server = http.createServer((req, res) => {
//     res.statusCode = 200;
//     res.setHeader("Content-Type", "text/plain")
//     res.end("Hello World modaj\n")
// });
// server.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
// });

  