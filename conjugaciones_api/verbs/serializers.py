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


class AnswerSerializer(serializers.Serializer):
    tense = serializers.CharField(required=True)
    form1s = serializers.CharField(allow_blank=True, required=False)
    form2s = serializers.CharField(allow_blank=True, required=False)
    form3s = serializers.CharField(allow_blank=True, required=False)
    form1p = serializers.CharField(allow_blank=True, required=False)
    form2p = serializers.CharField(allow_blank=True, required=False)
    form3p = serializers.CharField(allow_blank=True, required=False)


class VerbResponseSerializer(serializers.Serializer):
    answers = AnswerSerializer(many=True)
