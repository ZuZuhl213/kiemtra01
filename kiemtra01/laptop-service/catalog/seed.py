from .models import LaptopProduct


def seed_products():
    products = [
        {
            "name": "AeroBook Pro 14",
            "brand": "SkyTech",
            "price": "1299.00",
            "stock": 12,
            "description": "Slim productivity laptop with OLED display.",
            "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
            "specs": {"cpu": "Intel Core Ultra 7", "ram": "16GB", "storage": "1TB SSD"},
        },
        {
            "name": "Forge X16",
            "brand": "Volt",
            "price": "1699.00",
            "stock": 7,
            "description": "Gaming-focused laptop with strong cooling.",
            "image_url": "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200",
            "specs": {"cpu": "AMD Ryzen 9", "ram": "32GB", "storage": "1TB SSD"},
        },
    ]
    for payload in products:
        LaptopProduct.objects.update_or_create(name=payload["name"], defaults=payload)
