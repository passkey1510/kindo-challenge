from django.db import models

from trips.models import Trip


class Registration(models.Model):
    student_name = models.CharField(max_length=255)
    parent_name = models.CharField(max_length=255)
    parent_email = models.EmailField()
    trip = models.ForeignKey(
        Trip, on_delete=models.CASCADE, related_name="registrations"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student_name} - {self.trip.name}"


class Transaction(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"

    registration = models.ForeignKey(
        Registration, on_delete=models.CASCADE, related_name="transactions"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    card_last_four = models.CharField(max_length=4)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    transaction_id = models.CharField(max_length=100, blank=True, default="")
    error_message = models.TextField(blank=True, default="")
    attempts = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction {self.id} - {self.status}"
