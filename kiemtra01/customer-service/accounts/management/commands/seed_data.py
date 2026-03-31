from django.core.management.base import BaseCommand

from accounts.seed import seed_customers


class Command(BaseCommand):
    help = "Seed customer service sample data."

    def handle(self, *args, **options):
        seed_customers()
        self.stdout.write(self.style.SUCCESS("Customer seed completed."))
