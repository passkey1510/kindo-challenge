from datetime import date
from decimal import Decimal

import pytest

from payments.models import Registration
from trips.models import Trip


@pytest.fixture
def sample_trip(db):
    return Trip.objects.create(
        name="Auckland Museum Field Trip",
        date=date(2026, 3, 15),
        location="Auckland Museum, Auckland",
        cost=Decimal("25.00"),
        description="A fun day at the museum.",
        school_id="SCH-001",
        activity_id="ACT-FIELD-001",
    )


@pytest.fixture
def sample_registration(db, sample_trip):
    return Registration.objects.create(
        student_name="Jane Smith",
        parent_name="John Smith",
        parent_email="john@example.com",
        trip=sample_trip,
    )
