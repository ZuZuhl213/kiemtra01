from .models import MobileProduct


def seed_products():
    products = [
        {
            "name": "Nova X Pro",
            "brand": "Lumi",
            "price": "899.00",
            "stock": 25,
            "description": "Flagship phone with bright display and strong battery.",
            "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
            "specs": {"display": "6.7 OLED", "storage": "256GB", "camera": "50MP"},
        },
        {
            "name": "Pocket Air 5G",
            "brand": "Orbit",
            "price": "599.00",
            "stock": 30,
            "description": "Balanced everyday smartphone with fast charging.",
            "image_url": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5",
            "specs": {"display": "6.1 AMOLED", "storage": "128GB", "camera": "48MP"},
        },
    ]
    for payload in products:
        MobileProduct.objects.update_or_create(name=payload["name"], defaults=payload)
