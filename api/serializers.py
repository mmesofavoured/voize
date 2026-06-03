from rest_framework import serializers
from django.contrib.auth.models import User
from .models import TranscriptionRecord

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model  = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class TranscriptionSerializer(serializers.ModelSerializer):
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model  = TranscriptionRecord
        fields = ['id', 'type', 'input_text', 'output_text',
                  'audio_file', 'audio_url', 'duration', 'created_at']

    def get_audio_url(self, obj):
        if obj.audio_file:
            return f"http://127.0.0.1:8000/media/{obj.audio_file}"
        return None