from django.db import models
from django.contrib.auth.models import AbstractUser

from rest_framework.authtoken.models import Token


class ConjugacionesUser(AbstractUser):

    @classmethod
    def for_token_key(cls, key):
        return Token.objects.get(key=key).user

    @property
    def token(self):
        return Token.objects.get_or_create(user=self)[0].key