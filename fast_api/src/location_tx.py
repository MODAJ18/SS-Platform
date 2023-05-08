import pandas as pd
from faker import Faker
from geopy.geocoders import Nominatim

fake = Faker()
location_t = pd.read_csv("../Datasets/db/Locations.csv")


state_region_info = location_t.groupby(["state", "region"]).count()[["country"]].\
                                    rename(columns={"country": "count"}).reset_index()
def get_rand_location_data():
    geolocator = Nominatim(user_agent="geoapiExercises")
    lat, lng = fake.local_latlng()[0:2]
    location = geolocator.reverse(lat + "," + lng)
    address = location.raw['address']
    city = address.get('city', '')
    state = address.get('state', '')
    country = address.get('country', '')
    postal_code = address.get('postcode')
    new_state_region_matches = state_region_info[state_region_info["state"]==state]
    if new_state_region_matches.shape[0] > 0:
        region = new_state_region_matches.sample(1).iloc[0]["region"]
    else:
        region = "Unknown"
    return city, state, country, postal_code, region

def verify_as_new_location(country, state, zipcode, city):
    fil_1 = location_t["country"] == country
    fil_2 = location_t["state"] == state
    fil_3 = location_t["postal_code"] == zipcode
    fil_4 = location_t["city"] == city
    location_match_num = location_t[fil_1 & fil_2 & fil_3 & fil_4].shape[0]
    if location_match_num == 0:
        return True

    return False

def generate_location_id():
    return location_t["location_id"].max() + 1


# main
def add_location_TX():
    break_num = 100
    city, state, country, postal_code, region = get_rand_location_data()
    new_location_verifed = verify_as_new_location(city, state, country, postal_code)
    #     print(new_location_verifed)

    i = 0
    while not new_location_verifed:
        city, state, country, postal_code = get_rand_location_data()
        new_location_verifed = verify_as_new_location(city, state, country, postal_code)
        if i == break_num:
            break

    location_id = generate_location_id()
    dict_result = {
        "country": country,
        "city": city,
        "state": state,
        "postal_code": postal_code,
        "region": region,
        # "location_id": str(location_id),
    }

    return dict_result