from rest_framework import serializers

from .models import Verb, VerbConjugation



class VerbConjugationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerbConjugation
        fields = '__all__'


class VerbSerializer(serializers.ModelSerializer):
    verb_conjugations = VerbConjugationSerializer(many=True, read_only=True)

    class Meta:
        model = Verb
        fields = '__all__'
