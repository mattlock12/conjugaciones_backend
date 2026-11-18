from django.contrib.auth import authenticate
from django.db import transaction

from rest_framework import generics, mixins, permissions, response, status, viewsets

from .models import ConjugacionesUser
from .serializers import UserSerializer
from verbs.models import VerbWeighter, Verb


def _error(message):
    return response.Response(data={'errors': [message]}, status=status.HTTP_400_BAD_REQUEST)


class UsersViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    GET  /api/users/  -> the user identified by the `Authorization: Token <key>` header
    POST /api/users/  -> sign up

    Deliberately exposes no detail routes: the serialized user includes its auth token.
    """
    queryset = ConjugacionesUser.objects.all()
    serializer_class = UserSerializer

    def list(self, request):
        if not request.user.is_authenticated:
            return _error("Invalid Token")

        serializer = self.get_serializer(request.user)
        return response.Response(data=serializer.data, status=200)

    def create(self, request):
        email = (request.data.get('email') or '').strip()
        password = request.data.get('password')
        confirmpassword = request.data.get('confirmpassword')

        if not email or not password or password != confirmpassword:
            return _error("Invalid data")

        if ConjugacionesUser.objects.filter(username=email).exists():
            return _error("An account with that email already exists")

        with transaction.atomic():
            user = ConjugacionesUser.objects.create_user(email, email, password)
            VerbWeighter.objects.bulk_create(
                VerbWeighter(verb_id=verb_id, user=user)
                for verb_id in Verb.objects.values_list('id', flat=True)
            )

        serializer = self.get_serializer(user)
        return response.Response(data=serializer.data, status=200)


class LoginViewSet(generics.GenericAPIView):
    serializer_class = UserSerializer
    # Logging in must work even if the client still holds a stale token.
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', None)
        password = request.data.get('password', None)
        user = authenticate(username=email, password=password)
        if not user:
            return _error("Invalid login")

        serializer = self.get_serializer(user)
        return response.Response(data=serializer.data, status=200)
