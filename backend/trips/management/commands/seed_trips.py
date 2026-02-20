from datetime import date, timedelta

from django.core.management.base import BaseCommand

from trips.models import Trip


class Command(BaseCommand):
    help = "Seed the database with sample field trips"

    def handle(self, *args, **options):
        trip, created = Trip.objects.get_or_create(
            school_id="SCH-001",
            activity_id="ACT-FIELD-001",
            defaults={
                "name": "Auckland Museum Field Trip",
                "date": date.today() + timedelta(days=30),
                "location": "Auckland Museum, Auckland",
                "cost": 25.00,
                "description": (
                    "Join us for an exciting day at the Auckland Museum! "
                    "Students will explore natural history exhibits, learn about "
                    "New Zealand's cultural heritage, and participate in "
                    "interactive science demonstrations."
                ),
            },
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created trip: "{trip.name}"'))
        else:
            self.stdout.write(self.style.WARNING(f'Trip already exists: "{trip.name}"'))
