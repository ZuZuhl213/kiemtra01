from django.contrib.auth import get_user_model


def seed_staff():
    user_model = get_user_model()
    for payload in [
        {"username": "manager", "email": "manager@example.com", "full_name": "Store Manager"},
        {"username": "editor", "email": "editor@example.com", "full_name": "Catalog Editor"},
    ]:
        user, created = user_model.objects.get_or_create(username=payload["username"], defaults=payload)
        if created or not user.check_password("password123"):
            user.set_password("password123")
            user.role = "staff"
            user.is_staff = True
            user.save()
