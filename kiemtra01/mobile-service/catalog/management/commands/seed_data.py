from django.core.management.base import BaseCommand

from catalog.seed import seed_products


class Command(BaseCommand):
    help = "Seed mobile products."

    def handle(self, *args, **options):
        seed_products()
        self.stdout.write(self.style.SUCCESS("Mobile seed completed."))
