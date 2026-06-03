from django.db import models
from django.contrib.auth.models import User

class TranscriptionRecord(models.Model):
    TYPE_CHOICES = [
        ('tts', 'Text to Speech'),
        ('stt', 'Speech to Text'),
    ]
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='records')
    type        = models.CharField(max_length=3, choices=TYPE_CHOICES)
    input_text  = models.TextField(blank=True)
    output_text = models.TextField(blank=True)
    audio_file  = models.FileField(upload_to='audio/', blank=True, null=True)
    duration    = models.FloatField(null=True, blank=True)   # seconds
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} | {self.type} | {self.created_at:%Y-%m-%d}"