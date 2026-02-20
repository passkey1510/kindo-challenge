import re

from rest_framework import serializers

from .models import Registration, Transaction


class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = [
            "id",
            "student_name",
            "parent_name",
            "parent_email",
            "trip",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        validators = []

    def validate(self, data):
        if Registration.objects.filter(
            student_name__iexact=data["student_name"],
            parent_email__iexact=data["parent_email"],
            trip=data["trip"],
        ).exists():
            raise serializers.ValidationError(
                "This student is already registered for this trip."
            )
        return data


class ErrorResponseSerializer(serializers.Serializer):
    error = serializers.BooleanField(default=True)
    message = serializers.CharField()
    code = serializers.CharField()


class PaymentRequestSerializer(serializers.Serializer):
    registration_id = serializers.IntegerField()
    card_number = serializers.CharField(max_length=19)
    expiry_date = serializers.CharField(max_length=5)
    cvv = serializers.CharField(max_length=3)

    def validate_card_number(self, value):
        cleaned = value.replace(" ", "")
        if not cleaned.isdigit() or len(cleaned) != 16:
            raise serializers.ValidationError("Card number must be 16 digits.")
        return value

    def validate_expiry_date(self, value):
        if not re.match(r"^(0[1-9]|1[0-2])/\d{2}$", value):
            raise serializers.ValidationError("Expiry date must be in MM/YY format.")
        return value

    def validate_cvv(self, value):
        if not value.isdigit() or len(value) != 3:
            raise serializers.ValidationError("CVV must be 3 digits.")
        return value

    def validate_registration_id(self, value):
        if not Registration.objects.filter(id=value).exists():
            raise serializers.ValidationError("Registration not found.")
        return value


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id",
            "registration",
            "amount",
            "card_last_four",
            "status",
            "transaction_id",
            "error_message",
            "attempts",
            "created_at",
        ]
