import random
import time
from dataclasses import dataclass


@dataclass
class PaymentResponse:
    success: bool
    transaction_id: str | None = None
    error_message: str | None = None


class LegacyPaymentProcessor:
    def process_payment(self, payment_data):
        required_fields = [
            "student_name",
            "parent_name",
            "amount",
            "card_number",
            "expiry_date",
            "cvv",
            "school_id",
            "activity_id",
        ]
        for field in required_fields:
            if field not in payment_data:
                return PaymentResponse(
                    success=False, error_message=f"Missing required field: {field}"
                )

        card_num = payment_data["card_number"].replace(" ", "")
        if not (card_num.isdigit() and len(card_num) == 16):
            return PaymentResponse(
                success=False, error_message="Invalid card number. Must be 16 digits."
            )

        if not self._validate_expiry_format(payment_data["expiry_date"]):
            return PaymentResponse(
                success=False, error_message="Invalid expiry date format. Use MM/YY."
            )

        if not (payment_data["cvv"].isdigit() and len(payment_data["cvv"]) == 3):
            return PaymentResponse(
                success=False, error_message="Invalid CVV. Must be 3 digits."
            )

        if (
            not isinstance(payment_data["amount"], (int, float))
            or payment_data["amount"] <= 0
        ):
            return PaymentResponse(
                success=False, error_message="Payment amount must be a positive number."
            )

        time.sleep(1.5)

        if random.random() < 0.1:
            return PaymentResponse(
                success=False,
                error_message="Payment declined by processor. Please try again.",
            )

        transaction_id = f"TX-{int(time.time())}-{random.randint(1000, 9999)}"
        return PaymentResponse(success=True, transaction_id=transaction_id)

    def _validate_expiry_format(self, expiry):
        if not isinstance(expiry, str) or len(expiry) != 5:
            return False
        if expiry[2] != "/":
            return False
        month, year = expiry.split("/")
        if not (month.isdigit() and year.isdigit()):
            return False
        month_num = int(month)
        if month_num < 1 or month_num > 12:
            return False
        return True
