from rest_framework import viewsets

from .models import Verb
from .serializers import VerbSerializer


class VerbsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Verb.objects.all()
    serializer_class = VerbSerializer
