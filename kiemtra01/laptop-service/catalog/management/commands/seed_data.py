from django.core.management.base import BaseCommand

from catalog.seed import seed_products


class Command(BaseCommand):
    help = "Seed laptop products."

    def handle(self, *args, **options):
        seed_products()
        self.stdout.write(self.style.SUCCESS("Laptop seed completed."))
