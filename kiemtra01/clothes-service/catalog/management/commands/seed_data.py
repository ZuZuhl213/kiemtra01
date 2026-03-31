from django.core.management.base import BaseCommand

from catalog.seed import seed_products


class Command(BaseCommand):
    help = "Seed clothes products."

    def handle(self, *args, **options):
        seed_products()
        self.stdout.write(self.style.SUCCESS("Clothes seed completed."))
