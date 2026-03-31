import os

import requests


class ProductServiceClient:
    def __init__(self):
        self.timeout = int(os.getenv("SERVICE_TIMEOUT", "10"))
        self.base_urls = {
            "laptop": os.getenv("LAPTOP_SERVICE_URL", "http://laptop-service:8000"),
            "mobile": os.getenv("MOBILE_SERVICE_URL", "http://mobile-service:8000"),
            "clothes": os.getenv("CLOTHES_SERVICE_URL", "http://clothes-service:8000"),
        }

    def list_products(self, query=None):
        products = []
        for source in ("laptop", "mobile", "clothes"):
            params = {"search": query} if query else {}
            response = requests.get(f"{self.base_urls[source]}/api/products/", params=params, timeout=self.timeout)
            response.raise_for_status()
            for item in response.json():
                item["source"] = source
                products.append(item)
        return products

    def get_product(self, source, product_id):
        response = requests.get(f"{self.base_urls[source]}/api/products/{product_id}/", timeout=self.timeout)
        response.raise_for_status()
        payload = response.json()
        payload["source"] = source
        return payload
