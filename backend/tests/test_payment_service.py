from unittest.mock import MagicMock, patch

from payments.adapters.base import PaymentResult
from payments.models import Transaction
from payments.services.payment_service import PaymentService


class TestPaymentService:
    def test_successful_payment(self, sample_registration):
        mock_adapter = MagicMock()
        mock_adapter.process.return_value = PaymentResult(
            success=True, transaction_id="TX-123-4567"
        )

        service = PaymentService(adapter=mock_adapter)
        transaction = service.process_payment(
            registration=sample_registration,
            card_number="4111111111111111",
            expiry_date="12/26",
            cvv="123",
        )

        assert transaction.status == Transaction.Status.SUCCESS
        assert transaction.transaction_id == "TX-123-4567"
        assert transaction.attempts == 1
        assert transaction.card_last_four == "1111"

    def test_validation_error_no_retry(self, sample_registration):
        mock_adapter = MagicMock()
        mock_adapter.process.return_value = PaymentResult(
            success=False,
            error_message="Invalid card number. Must be 16 digits.",
            is_retryable=False,
        )

        service = PaymentService(adapter=mock_adapter)
        transaction = service.process_payment(
            registration=sample_registration,
            card_number="4111111111111111",
            expiry_date="12/26",
            cvv="123",
        )

        assert transaction.status == Transaction.Status.FAILED
        assert transaction.attempts == 1
        assert mock_adapter.process.call_count == 1

    @patch("payments.services.payment_service.time.sleep")
    def test_retry_on_declined(self, mock_sleep, sample_registration):
        mock_adapter = MagicMock()
        mock_adapter.process.side_effect = [
            PaymentResult(
                success=False,
                error_message="Payment declined by processor. Please try again.",
                is_retryable=True,
            ),
            PaymentResult(
                success=False,
                error_message="Payment declined by processor. Please try again.",
                is_retryable=True,
            ),
            PaymentResult(success=True, transaction_id="TX-123-4567"),
        ]

        service = PaymentService(adapter=mock_adapter)
        transaction = service.process_payment(
            registration=sample_registration,
            card_number="4111111111111111",
            expiry_date="12/26",
            cvv="123",
        )

        assert transaction.status == Transaction.Status.SUCCESS
        assert transaction.attempts == 3
        assert mock_adapter.process.call_count == 3
        assert mock_sleep.call_count == 2
        mock_sleep.assert_any_call(1)
        mock_sleep.assert_any_call(2)

    @patch("payments.services.payment_service.time.sleep")
    def test_retry_exhausted(self, mock_sleep, sample_registration):
        mock_adapter = MagicMock()
        mock_adapter.process.return_value = PaymentResult(
            success=False,
            error_message="Payment declined by processor. Please try again.",
            is_retryable=True,
        )

        service = PaymentService(adapter=mock_adapter)
        transaction = service.process_payment(
            registration=sample_registration,
            card_number="4111111111111111",
            expiry_date="12/26",
            cvv="123",
        )

        assert transaction.status == Transaction.Status.FAILED
        assert transaction.attempts == 3
        assert mock_adapter.process.call_count == 3

    @patch("payments.services.payment_service.time.sleep")
    def test_exponential_backoff_delays(self, mock_sleep, sample_registration):
        mock_adapter = MagicMock()
        mock_adapter.process.side_effect = [
            PaymentResult(
                success=False,
                error_message="Payment declined by processor. Please try again.",
                is_retryable=True,
            ),
            PaymentResult(
                success=False,
                error_message="Payment declined by processor. Please try again.",
                is_retryable=True,
            ),
            PaymentResult(
                success=False,
                error_message="Payment declined by processor. Please try again.",
                is_retryable=True,
            ),
        ]

        service = PaymentService(adapter=mock_adapter)
        service.process_payment(
            registration=sample_registration,
            card_number="4111111111111111",
            expiry_date="12/26",
            cvv="123",
        )

        # Delays: 1s after attempt 1, 2s after attempt 2, no delay after final attempt
        assert mock_sleep.call_count == 2
        mock_sleep.assert_any_call(1)
        mock_sleep.assert_any_call(2)

    def test_transaction_amount_matches_trip_cost(self, sample_registration):
        mock_adapter = MagicMock()
        mock_adapter.process.return_value = PaymentResult(
            success=True, transaction_id="TX-123"
        )

        service = PaymentService(adapter=mock_adapter)
        transaction = service.process_payment(
            registration=sample_registration,
            card_number="4111111111111111",
            expiry_date="12/26",
            cvv="123",
        )

        assert float(transaction.amount) == 25.00
