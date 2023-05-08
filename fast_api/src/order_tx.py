import pandas as pd
from faker import Faker
import random
import datetime

fake = Faker()
order_t = pd.read_csv("../Datasets/db/Orders.csv")
customer_t = pd.read_csv("../Datasets/db/Customers.csv")
location_t = pd.read_csv("../Datasets/db/Locations.csv")
product_t = pd.read_csv("../Datasets/db/Products.csv")
order_detail_t = pd.read_csv("../Datasets/db/Order_Details.csv")

def make_order_date():
    return fake.date_between(start_date='-10y', end_date='today')

def generate_ship_info(order_date):
    ship_modes = order_t["ship_mode"].unique()
    new_ship_mode = ship_modes[random.randrange(0, len(ship_modes))]

    if new_ship_mode == "Same Day":
        ship_date = order_date
    elif new_ship_mode == "First Class":
        ship_date = order_date + datetime.timedelta(days=random.randrange(1, 6))
    elif new_ship_mode == "Second Class":
        ship_date = order_date + datetime.timedelta(days=random.randrange(7, 15))
    else:
        ship_date = order_date + datetime.timedelta(days=random.randrange(16, 30))

    return new_ship_mode, ship_date

def generate_order_id(date):
    # order_id
    order_id_pt_1_l = list(order_t["order_id"].apply(lambda x: x.split("-")[0]).unique())
    order_id_pt_2_l = list(order_t["order_id"].apply(lambda x: x.split("-")[1]).unique())
    order_id_pt_3_l = list(order_t["order_id"].apply(lambda x: x.split("-")[2]).unique())

    selected_index_pt1 = random.randrange(0, len(order_id_pt_1_l))
    new_pt1 = order_id_pt_1_l[selected_index_pt1]

    new_pt2 = str(date.year)

    random_six_digit = '{:06}'.format(random.randrange(1, 10 ** 6))
    while random_six_digit in order_id_pt_3_l:
        print('repeat')
        random_six_digit = '{:06}'.format(random.randrange(1, 10 ** 6))
    new_pt3 = random_six_digit

    new_order_id = new_pt1 + "-" + new_pt2 + "-" + new_pt3
    return new_order_id

def get_customer_id():
    customer_id_ind = random.randrange(0, customer_t['customer_id'].shape[0])
    customer_id_selected = customer_t['customer_id'][customer_id_ind]
    return customer_id_selected

def get_related_ids():
    location_id_selected = location_t["location_id"][random.randrange(0, location_t.shape[0])]
    product_id_selected = product_t["product_id"][random.randrange(0, product_t.shape[0])]

    return location_id_selected, product_id_selected
def get_sales_data(product_id_selected):
    ## quantity
    n_items = 1000
    x = round(order_detail_t["quantity"].value_counts() / order_detail_t["quantity"].shape[0] * n_items)
    # make pool of choices based on probabilites
    col_pool = []
    for r, r_id in list(zip(x, x.index)):
        for occurance in range(int(r)):
            col_pool.append(r_id)
    selected_index = random.randrange(0, len(col_pool))
    new_quantity = col_pool[selected_index]

    sales_change_l = [-1000, -500, -250, -100, -50, -25, -10, -5, 1, 2, 4, 5, 8,
                      10, 15, 25, 37, 50, 75, 100, 150, 200, 300, 500, 1000]
    new_expected_sales = float(
        (product_t[product_t["product_id"] == product_id_selected]["product_price"] * new_quantity))
    new_baseline_sales = new_expected_sales + random.choice(sales_change_l) * new_quantity
    new_discount = round(1 - min(new_baseline_sales / new_expected_sales, 1), 2)
    new_profit = new_baseline_sales - new_expected_sales

    return new_quantity, new_baseline_sales, new_discount, new_profit
def generate_order_detail_id():
    return order_detail_t["order_detail_id"].max() + 1
def order_detail_TX_pt(order_id):
    location_id, product_id = get_related_ids()
    quantity, sales, discount, profit = get_sales_data(product_id_selected=product_id)
    order_detail_id = generate_order_detail_id()

    result_dict_order_details = {
        "order_detail_id": str(order_detail_id),
        "order_id": str(order_id),
        "product_id": str(product_id),
        "location_id": str(location_id),
        "sales": str(sales),
        "quantity": str(quantity),
        "discount": str(discount),
        "profit": str(profit),
    }

    return result_dict_order_details


# main
def generate_order_TX():
    order_date = make_order_date()
    ship_mode, ship_date = generate_ship_info(order_date)
    order_id = generate_order_id(date=order_date)
    customer_id = get_customer_id()

    order_detail_num = random.randrange(1, 5)
    order_detial_l = []
    for i in range(order_detail_num):
        order_detial_l.append(order_detail_TX_pt(order_id=order_id))

    result_dict = {
        "order_id": order_id,
        "order_date": order_date,
        "ship_date": ship_date,
        "ship_mode": ship_mode,
        "customer_id": str(customer_id),
        "order_details": order_detial_l
    }
    return result_dict
