from rest_framework import serializers

from .models import Trip


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = [
            "id",
            "name",
            "date",
            "location",
            "cost",
            "description",
            "school_id",
            "activity_id",
        ]
