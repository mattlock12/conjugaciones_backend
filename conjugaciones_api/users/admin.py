from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import ConjugacionesUser


admin.site.register(ConjugacionesUser, UserAdmin)
