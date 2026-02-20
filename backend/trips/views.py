from rest_framework import generics

from .models import Trip
from .serializers import TripSerializer


class TripListView(generics.ListAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer


class TripDetailView(generics.RetrieveAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
