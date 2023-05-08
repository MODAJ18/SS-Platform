from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel

from src.customer_tx import register_customer_TX
from src.location_tx import add_location_TX
from src.order_tx import generate_order_TX

data_api = FastAPI()

@data_api.get("/")
def read_root():
    return {"Hello": "World"}


@data_api.get("/api/v1/resources/customers/tx")
def customer_tx():
    return register_customer_TX()

@data_api.get("/api/v1/resources/locations/tx")
def location_tx():
    return add_location_TX()

@data_api.get("/api/v1/resources/orders/tx")
def order_tx():
    return generate_order_TX()
