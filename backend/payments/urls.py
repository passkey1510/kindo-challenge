from django.urls import path

from .views import PaymentCreateView, PaymentStatusView, RegistrationCreateView

urlpatterns = [
    path(
        "registrations/", RegistrationCreateView.as_view(), name="registration-create"
    ),
    path("payments/", PaymentCreateView.as_view(), name="payment-create"),
    path(
        "payments/<int:pk>/status/", PaymentStatusView.as_view(), name="payment-status"
    ),
]
