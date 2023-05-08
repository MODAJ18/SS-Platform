import pandas as pd
from faker import Faker
import random


fake = Faker()
# from pathlib import Path
# project_path = Path(os.getcwd()).parent.absolute()

customer_t = pd.read_csv("../Datasets/db/Customers.csv")

# helper functions
def generate_email():
    break_num = 100
    email = fake.email()
    i = 0
    while email in customer_t["email"].to_list():
        email = fake.email()
        if i == break_num:
            break
    return email

def generate_password():
    break_num = 100
    password = fake.password()
    i = 0
    while password in customer_t["password"].to_list():
        password = fake.password()
        if i == break_num:
            break
    return password

def generate_username():
    break_num = 100
    username = fake.user_name()
    i = 0
    while username in customer_t["username"].to_list():
        username = fake.user_name()
        if i == break_num:
            break
    return username

def generate_customer_id():
    c_code_pt_1 = 'RS'
    rows_c_code_pt_1 = customer_t[customer_t["customer_id"].str.contains('RS', na=False)]
    rows_c_code_pt_1_ids = rows_c_code_pt_1["customer_id"].to_list()

    c_code_pt_2 = '{:05}'.format(random.randrange(1, 10 ** 5))  # 5-digit number

    new_c_code = c_code_pt_1 + "-" + c_code_pt_2

    while new_c_code in rows_c_code_pt_1_ids:
        c_code_pt_2 = '{:05}'.format(random.randrange(1, 10 ** 5))
        new_c_code = c_code_pt_1 + "-" + c_code_pt_2
    return new_c_code

def generate_customer_name():
    return fake.name()

def generate_customer_segment():
    n_items = 10
    x = round(customer_t["segment"].value_counts() / customer_t["segment"].shape[0] * n_items)

    # make pool of choices based on probabilites
    segment_pool = []
    for r, r_id in list(zip(x, x.index)):
        for occurance in range(int(r)):
            segment_pool.append(r_id)

    # select random index from pool
    selected_index = random.randrange(0, len(segment_pool))
    new_customer_segment = segment_pool[selected_index]
    return new_customer_segment


# main
def register_customer_TX():
    email = generate_email()
    password = generate_password()
    username = generate_username()

    customer_id = generate_customer_id()
    customer_name = generate_customer_name()
    customer_segment = generate_customer_segment()

    dict_result = {
        "email":email,
        "password": password,
        "username": username,
        "customer_id": customer_id,
        "customer_name": customer_name,
        "customer_segment": customer_segment,
    }
    return dict_result