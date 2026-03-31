from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomerUser(AbstractUser):
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, default="customer")

    def __str__(self):
        return self.username
