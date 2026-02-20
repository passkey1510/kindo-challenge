from unittest.mock import patch

from payments.adapters.legacy_adapter import LegacyPaymentAdapter


class TestLegacyPaymentAdapter:
    def setup_method(self):
        self.adapter = LegacyPaymentAdapter()
        self.valid_data = {
            "student_name": "Jane Smith",
            "parent_name": "John Smith",
            "amount": 25.00,
            "card_number": "4111111111111111",
            "expiry_date": "12/26",
            "cvv": "123",
            "school_id": "SCH-001",
            "activity_id": "ACT-FIELD-001",
        }

    @patch("payments.adapters.legacy_processor.random.random", return_value=0.5)
    @patch("payments.adapters.legacy_processor.time.sleep")
    def test_successful_payment(self, mock_sleep, mock_random):
        result = self.adapter.process(self.valid_data)
        assert result.success is True
        assert result.transaction_id is not None
        assert result.is_retryable is False

    @patch("payments.adapters.legacy_processor.random.random", return_value=0.05)
    @patch("payments.adapters.legacy_processor.time.sleep")
    def test_declined_payment_is_retryable(self, mock_sleep, mock_random):
        result = self.adapter.process(self.valid_data)
        assert result.success is False
        assert result.is_retryable is True
        assert "declined" in result.error_message.lower()

    def test_validation_error_not_retryable(self):
        data = self.valid_data.copy()
        data["card_number"] = "1234"
        result = self.adapter.process(data)
        assert result.success is False
        assert result.is_retryable is False

    def test_missing_field_not_retryable(self):
        data = self.valid_data.copy()
        del data["cvv"]
        result = self.adapter.process(data)
        assert result.success is False
        assert result.is_retryable is False
        assert "Missing required field" in result.error_message

    def test_invalid_expiry_not_retryable(self):
        data = self.valid_data.copy()
        data["expiry_date"] = "13/26"
        result = self.adapter.process(data)
        assert result.success is False
        assert result.is_retryable is False

    def test_invalid_cvv_not_retryable(self):
        data = self.valid_data.copy()
        data["cvv"] = "12"
        result = self.adapter.process(data)
        assert result.success is False
        assert result.is_retryable is False

    def test_negative_amount_not_retryable(self):
        data = self.valid_data.copy()
        data["amount"] = -10
        result = self.adapter.process(data)
        assert result.success is False
        assert result.is_retryable is False
