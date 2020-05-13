from rest_framework import serializers

from .models import ConjugacionesUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConjugacionesUser
        fields = ['email', 'token', ]
