from .base import PaymentProcessorAdapter, PaymentResult
from .legacy_processor import LegacyPaymentProcessor

DECLINED_MESSAGE = "Payment declined by processor"


class LegacyPaymentAdapter(PaymentProcessorAdapter):
    def __init__(self):
        self._processor = LegacyPaymentProcessor()

    def process(self, payment_data: dict) -> PaymentResult:
        response = self._processor.process_payment(payment_data)

        if response.success:
            return PaymentResult(
                success=True,
                transaction_id=response.transaction_id,
            )

        is_retryable = (
            response.error_message is not None
            and DECLINED_MESSAGE in response.error_message
        )

        return PaymentResult(
            success=False,
            error_message=response.error_message,
            is_retryable=is_retryable,
        )
