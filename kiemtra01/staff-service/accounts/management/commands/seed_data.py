from django.core.management.base import BaseCommand

from accounts.seed import seed_staff


class Command(BaseCommand):
    help = "Seed staff service sample data."

    def handle(self, *args, **options):
        seed_staff()
        self.stdout.write(self.style.SUCCESS("Staff seed completed."))
