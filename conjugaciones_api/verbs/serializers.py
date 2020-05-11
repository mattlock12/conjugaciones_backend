from rest_framework import serializers

from .models import Verb, VerbConjugation
from users.serializers import UserSerializer



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
    user = UserSerializer()

    @property
    def answers_by_tense(self):
        self.is_valid(raise_exception=True)

        return {
            answer['tense']: answer
            for answer in self.validated_data['answers']
        }
