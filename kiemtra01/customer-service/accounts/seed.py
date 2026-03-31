from django.contrib.auth import get_user_model


def seed_customers():
    user_model = get_user_model()
    samples = [
        {
            "username": "alice",
            "email": "alice@example.com",
            "full_name": "Alice Nguyen",
            "phone_number": "0901000001",
        },
        {
            "username": "bob",
            "email": "bob@example.com",
            "full_name": "Bob Tran",
            "phone_number": "0901000002",
        },
    ]
    for payload in samples:
        user, created = user_model.objects.get_or_create(
            username=payload["username"],
            defaults=payload,
        )
        if created or not user.check_password("password123"):
            user.set_password("password123")
            user.role = "customer"
            user.save()
