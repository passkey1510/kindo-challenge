from django.db import IntegrityError
from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Registration, Transaction
from .serializers import (
    PaymentRequestSerializer,
    RegistrationSerializer,
    TransactionSerializer,
)
from .services.payment_service import PaymentService


class RegistrationCreateView(generics.CreateAPIView):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer

    def perform_create(self, serializer):
        try:
            serializer.save()
        except IntegrityError:
            raise serializers.ValidationError(
                "This student is already registered for this trip."
            ) from None


class PaymentCreateView(APIView):
    def post(self, request):
        serializer = PaymentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        registration = Registration.objects.get(
            id=serializer.validated_data["registration_id"]
        )

        service = PaymentService()
        try:
            transaction = service.process_payment(
                registration=registration,
                card_number=serializer.validated_data["card_number"],
                expiry_date=serializer.validated_data["expiry_date"],
                cvv=serializer.validated_data["cvv"],
            )
        except Exception:
            return Response(
                {
                    "error": True,
                    "message": "An unexpected error occurred while processing payment.",
                    "code": "SERVER_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if transaction.status == Transaction.Status.FAILED:
            return Response(
                {
                    "error": True,
                    "message": transaction.error_message,
                    "code": "PAYMENT_PROCESSOR_ERROR",
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            TransactionSerializer(transaction).data,
            status=status.HTTP_201_CREATED,
        )


class PaymentStatusView(generics.RetrieveAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
