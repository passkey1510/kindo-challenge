import logging
import time
from decimal import Decimal

from payments.adapters.base import PaymentProcessorAdapter, PaymentResult
from payments.adapters.legacy_adapter import LegacyPaymentAdapter
from payments.models import Registration, Transaction

logger = logging.getLogger(__name__)

MAX_RETRIES = 3
BASE_DELAY = 1  # seconds


class PaymentService:
    def __init__(self, adapter: PaymentProcessorAdapter | None = None):
        self._adapter = adapter or LegacyPaymentAdapter()

    def process_payment(
        self,
        registration: Registration,
        card_number: str,
        expiry_date: str,
        cvv: str,
    ) -> Transaction:
        trip = registration.trip
        amount = float(trip.cost)
        card_last_four = card_number.replace(" ", "")[-4:]

        transaction = Transaction.objects.create(
            registration=registration,
            amount=Decimal(str(trip.cost)),
            card_last_four=card_last_four,
            status=Transaction.Status.PENDING,
        )

        payment_data = {
            "student_name": registration.student_name,
            "parent_name": registration.parent_name,
            "amount": amount,
            "card_number": card_number,
            "expiry_date": expiry_date,
            "cvv": cvv,
            "school_id": trip.school_id,
            "activity_id": trip.activity_id,
        }

        result = self._process_with_retry(transaction, payment_data)

        if result.success:
            transaction.status = Transaction.Status.SUCCESS
            transaction.transaction_id = result.transaction_id or ""
        else:
            transaction.status = Transaction.Status.FAILED
            transaction.error_message = result.error_message or ""

        transaction.save()
        return transaction

    def _process_with_retry(
        self, transaction: Transaction, payment_data: dict
    ) -> PaymentResult:
        last_result = None

        for attempt in range(1, MAX_RETRIES + 1):
            transaction.attempts = attempt
            transaction.save(update_fields=["attempts"])

            result = self._adapter.process(payment_data)
            last_result = result

            if result.success:
                return result

            if not result.is_retryable:
                return result

            if attempt < MAX_RETRIES:
                delay = BASE_DELAY * (2 ** (attempt - 1))
                logger.info(
                    "Payment attempt %d failed (retryable), retrying in %ds",
                    attempt,
                    delay,
                )
                time.sleep(delay)

        return last_result  # type: ignore[return-value]
