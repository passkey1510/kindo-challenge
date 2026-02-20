import uuid
from unittest.mock import patch

import pytest
from rest_framework.test import APIClient

from payments.models import Transaction


@pytest.fixture
def api_client():
    return APIClient()


class TestTripAPI:
    def test_get_trip(self, api_client, sample_trip):
        response = api_client.get(f"/api/v1/trips/{sample_trip.id}/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Auckland Museum Field Trip"
        assert data["cost"] == "25.00"
        assert data["school_id"] == "SCH-001"

    def test_get_nonexistent_trip(self, api_client, db):
        fake_uuid = uuid.uuid4()
        response = api_client.get(f"/api/v1/trips/{fake_uuid}/")
        assert response.status_code == 404


class TestRegistrationAPI:
    def test_create_registration(self, api_client, sample_trip):
        response = api_client.post(
            "/api/v1/registrations/",
            {
                "student_name": "Jane Smith",
                "parent_name": "John Smith",
                "parent_email": "john@example.com",
                "trip": sample_trip.id,
            },
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert data["student_name"] == "Jane Smith"
        assert data["parent_email"] == "john@example.com"

    def test_create_registration_missing_fields(self, api_client, db):
        response = api_client.post(
            "/api/v1/registrations/",
            {"student_name": "Jane Smith"},
            format="json",
        )
        assert response.status_code == 400

    def test_create_registration_invalid_email(self, api_client, sample_trip):
        response = api_client.post(
            "/api/v1/registrations/",
            {
                "student_name": "Jane Smith",
                "parent_name": "John Smith",
                "parent_email": "not-an-email",
                "trip": sample_trip.id,
            },
            format="json",
        )
        assert response.status_code == 400


class TestPaymentAPI:
    @patch("payments.views.PaymentService")
    def test_successful_payment(self, MockService, api_client, sample_registration):
        mock_transaction = Transaction(
            id=1,
            registration=sample_registration,
            amount=sample_registration.trip.cost,
            card_last_four="1111",
            status=Transaction.Status.SUCCESS,
            transaction_id="TX-123-4567",
            attempts=1,
        )
        MockService.return_value.process_payment.return_value = mock_transaction

        response = api_client.post(
            "/api/v1/payments/",
            {
                "registration_id": sample_registration.id,
                "card_number": "4111111111111111",
                "expiry_date": "12/26",
                "cvv": "123",
            },
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["transaction_id"] == "TX-123-4567"

    @patch("payments.views.PaymentService")
    def test_failed_payment(self, MockService, api_client, sample_registration):
        mock_transaction = Transaction(
            id=1,
            registration=sample_registration,
            amount=sample_registration.trip.cost,
            card_last_four="1111",
            status=Transaction.Status.FAILED,
            error_message="Payment declined by processor.",
            attempts=3,
        )
        MockService.return_value.process_payment.return_value = mock_transaction

        response = api_client.post(
            "/api/v1/payments/",
            {
                "registration_id": sample_registration.id,
                "card_number": "4111111111111111",
                "expiry_date": "12/26",
                "cvv": "123",
            },
            format="json",
        )
        assert response.status_code == 502
        data = response.json()
        assert data["error"] is True
        assert data["code"] == "PAYMENT_PROCESSOR_ERROR"

    def test_payment_invalid_card(self, api_client, sample_registration):
        response = api_client.post(
            "/api/v1/payments/",
            {
                "registration_id": sample_registration.id,
                "card_number": "123",
                "expiry_date": "12/26",
                "cvv": "123",
            },
            format="json",
        )
        assert response.status_code == 400

    def test_payment_invalid_expiry(self, api_client, sample_registration):
        response = api_client.post(
            "/api/v1/payments/",
            {
                "registration_id": sample_registration.id,
                "card_number": "4111111111111111",
                "expiry_date": "13/26",
                "cvv": "123",
            },
            format="json",
        )
        assert response.status_code == 400

    def test_payment_invalid_cvv(self, api_client, sample_registration):
        response = api_client.post(
            "/api/v1/payments/",
            {
                "registration_id": sample_registration.id,
                "card_number": "4111111111111111",
                "expiry_date": "12/26",
                "cvv": "12",
            },
            format="json",
        )
        assert response.status_code == 400

    def test_payment_nonexistent_registration(self, api_client, db):
        response = api_client.post(
            "/api/v1/payments/",
            {
                "registration_id": 9999,
                "card_number": "4111111111111111",
                "expiry_date": "12/26",
                "cvv": "123",
            },
            format="json",
        )
        assert response.status_code == 400


class TestPaymentStatusAPI:
    def test_get_payment_status(self, api_client, sample_registration):
        transaction = Transaction.objects.create(
            registration=sample_registration,
            amount=sample_registration.trip.cost,
            card_last_four="1111",
            status=Transaction.Status.SUCCESS,
            transaction_id="TX-123-4567",
            attempts=1,
        )
        response = api_client.get(f"/api/v1/payments/{transaction.id}/status/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["transaction_id"] == "TX-123-4567"

    def test_get_nonexistent_payment_status(self, api_client, db):
        response = api_client.get("/api/v1/payments/999/status/")
        assert response.status_code == 404
