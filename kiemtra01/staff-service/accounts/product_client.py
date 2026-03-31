import os
from decimal import Decimal

import requests


class ProductAdminClient:
    def __init__(self):
        self.timeout = int(os.getenv("SERVICE_TIMEOUT", "10"))
        self.base_urls = {
            "laptop": os.getenv("LAPTOP_SERVICE_URL", "http://laptop-service:8000"),
            "mobile": os.getenv("MOBILE_SERVICE_URL", "http://mobile-service:8000"),
            "clothes": os.getenv("CLOTHES_SERVICE_URL", "http://clothes-service:8000"),
        }

    def list_all(self):
        products = []
        for source, base_url in self.base_urls.items():
            response = requests.get(f"{base_url}/api/products/", timeout=self.timeout)
            response.raise_for_status()
            for item in response.json():
                item["category"] = source
                products.append(item)
        return products

    def _json_ready(self, payload):
        return {
            key: str(value) if isinstance(value, Decimal) else value
            for key, value in payload.items()
        }

    def create(self, category, payload):
        response = requests.post(
            f"{self.base_urls[category]}/api/products/",
            json=self._json_ready(payload),
            timeout=self.timeout,
        )
        response.raise_for_status()
        data = response.json()
        data["category"] = category
        return data

    def update(self, category, product_id, payload):
        response = requests.put(
            f"{self.base_urls[category]}/api/products/{product_id}/",
            json=self._json_ready(payload),
            timeout=self.timeout,
        )
        response.raise_for_status()
        data = response.json()
        data["category"] = category
        return data
