import uuid

from django.db import models


class Trip(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    date = models.DateField()
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, default="")
    school_id = models.CharField(max_length=50)
    activity_id = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
