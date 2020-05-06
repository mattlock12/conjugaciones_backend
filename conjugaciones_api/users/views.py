from rest_framework import generics, response, status, views, viewsets
from rest_framework.authtoken.models import Token

from .models import ConjugacionesUser
from .serializers import UserSerializer


class UsersViewSet(viewsets.ModelViewSet):
    queryset = ConjugacionesUser.objects.all()
    serializer_class = UserSerializer

    def list(self, request):
        auth = request.headers.get('Authorization')
        if not auth:
            return response.Response(data={'errors': ["Invalid Token"]}, status=status.HTTP_400_BAD_REQUEST)

        token_key = auth.split('Token ')[1].strip()
        token = Token.objects.filter(key=token_key).first()
        if not token:
            return response.Response(data={'errors': ["Invalid Token"]}, status=status.HTTP_400_BAD_REQUEST)

        user = token.user
        serializer = self.get_serializer(user)

        return response.Response(data=serializer.data, status=200)

    def create(self, request):
        password = request.data.get('password')
        confirmpassword = request.data.pop('confirmpassword')

        if not password or not confirmpassword or password != confirmpassword:
           return response.Response(data={'errors': ["Invalid data"]}, status=status.HTTP_400_BAD_REQUEST)

        return super(UsersViewSet, self).create(request)


class LoginViewSet(generics.GenericAPIView):
    serializer_class = UserSerializer

    def post(self, request):
        email = request.data.get('email', None)
        user = ConjugacionesUser.objects.filter(email=email).first()
        if not user:
           return response.Response(data={'errors': ["Invalid email"]}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(user)
        return response.Response(data=serializer.data, status=200)
