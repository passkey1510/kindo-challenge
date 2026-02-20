from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class PaymentResult:
    success: bool
    transaction_id: str | None = None
    error_message: str | None = None
    is_retryable: bool = False


class PaymentProcessorAdapter(ABC):
    @abstractmethod
    def process(self, payment_data: dict) -> PaymentResult:
        """Process a payment and return a PaymentResult."""
