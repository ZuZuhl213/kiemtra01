from .models import ClothesProduct


def seed_products():
    products = [
        {
            "name": "Urban Overshirt",
            "brand": "Northline",
            "price": "79.00",
            "stock": 18,
            "description": "Lightweight overshirt for daily city wear.",
            "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
            "specs": {"material": "Cotton twill", "fit": "Regular", "size_range": "S-XL"},
        },
        {
            "name": "Flex Denim",
            "brand": "Atelier",
            "price": "59.00",
            "stock": 24,
            "description": "Stretch denim jeans with a tapered silhouette.",
            "image_url": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
            "specs": {"material": "Denim", "fit": "Tapered", "size_range": "28-36"},
        },
    ]
    for payload in products:
        ClothesProduct.objects.update_or_create(name=payload["name"], defaults=payload)
