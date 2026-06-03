import os
import uuid
import speech_recognition as sr
from gtts import gTTS
from deep_translator import GoogleTranslator
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from .models import TranscriptionRecord
from .serializers import RegisterSerializer, TranscriptionSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Account created successfully.'}, status=201)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def text_to_speech(request):
    text = request.data.get('text', '').strip()
    lang = request.data.get('lang', 'en')
    tld  = request.data.get('tld', 'com')
    slow = request.data.get('slow', False)

    if not text:
        return Response({'error': 'No text provided.'}, status=400)

    filename = f"audio/{uuid.uuid4()}.mp3"
    filepath = os.path.join('media', filename)
    os.makedirs('media/audio', exist_ok=True)

    try:
        tts = gTTS(text=text, lang=lang, tld=tld, slow=slow)
        tts.save(filepath)
    except Exception:
        tts = gTTS(text=text, lang='en', tld='com', slow=False)
        tts.save(filepath)

    record = TranscriptionRecord.objects.create(
        user=request.user, type='tts',
        input_text=text, audio_file=filename
    )
    return Response({'audio_url': f"/media/{filename}", 'id': record.id})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def translate_and_speak(request):
    text        = request.data.get('text', '').strip()
    source_lang = request.data.get('source_lang', 'auto')
    target_lang = request.data.get('target_lang', 'en')
    tld         = request.data.get('tld', 'com')
    slow        = request.data.get('slow', False)

    if not text:
        return Response({'error': 'No text provided.'}, status=400)

    # Translate
    try:
        translated = GoogleTranslator(
            source=source_lang,
            target=target_lang
        ).translate(text)
    except Exception as e:
        return Response({'error': f'Translation failed: {str(e)}'}, status=400)

    # Convert translated text to speech
    filename = f"audio/{uuid.uuid4()}.mp3"
    filepath = os.path.join('media', filename)
    os.makedirs('media/audio', exist_ok=True)

    try:
        tts = gTTS(text=translated, lang=target_lang, tld=tld, slow=slow)
        tts.save(filepath)
    except Exception:
        tts = gTTS(text=translated, lang='en', tld='com', slow=False)
        tts.save(filepath)

    record = TranscriptionRecord.objects.create(
        user=request.user, type='tts',
        input_text=text,
        output_text=translated,
        audio_file=filename
    )
    return Response({
        'translated_text': translated,
        'audio_url': f"/media/{filename}",
        'id': record.id
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def speech_to_text(request):
    import subprocess
    from django.conf import settings

    audio = request.FILES.get('audio')
    if not audio:
        return Response({'error': 'No audio file provided.'}, status=400)

    # Use absolute paths based on Django BASE_DIR
    audio_dir  = os.path.join(settings.BASE_DIR, 'media', 'audio')
    os.makedirs(audio_dir, exist_ok=True)

    uid        = uuid.uuid4()
    temp_input = os.path.join(audio_dir, f"temp_{uid}")
    temp_wav   = os.path.join(audio_dir, f"temp_{uid}.wav")

    # Save uploaded file
    with open(temp_input, 'wb') as f:
        for chunk in audio.chunks():
            f.write(chunk)

    # Convert to WAV using ffmpeg
    try:
        result = subprocess.run(
            ['ffmpeg', '-y', '-i', temp_input, '-ar', '16000', '-ac', '1', temp_wav],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode != 0:
            return Response({
                'error': f'Audio conversion failed: {result.stderr[-200:]}'
            }, status=400)
    except FileNotFoundError:
        # ffmpeg not found — try recognizing the original file directly
        temp_wav = temp_input
    except subprocess.TimeoutExpired:
        return Response({'error': 'Audio conversion timed out.'}, status=400)
    except Exception as e:
        return Response({'error': f'Conversion error: {str(e)}'}, status=400)

    # Transcribe
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(temp_wav) as source:
            recognizer.adjust_for_ambient_noise(source, duration=0.3)
            data = recognizer.record(source)
        text = recognizer.recognize_google(data)
    except sr.UnknownValueError:
        return Response({'error': 'Could not understand audio. Please speak clearly and try again.'}, status=422)
    except sr.RequestError:
        return Response({'error': 'Speech recognition service unavailable. Check your internet connection.'}, status=503)
    except Exception as e:
        return Response({'error': f'Transcription error: {str(e)}'}, status=400)
    finally:
        if os.path.exists(temp_input): os.remove(temp_input)
        if os.path.exists(temp_wav) and temp_wav != temp_input:
            os.remove(temp_wav)

    record = TranscriptionRecord.objects.create(
        user=request.user, type='stt', output_text=text
    )
    return Response({'text': text, 'id': record.id})


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def history(request):
    if request.method == 'GET':
        records = TranscriptionRecord.objects.filter(user=request.user)
        return Response(TranscriptionSerializer(records, many=True).data)

    if request.method == 'DELETE':
        pk = request.query_params.get('id')
        TranscriptionRecord.objects.filter(user=request.user, pk=pk).delete()
        return Response(status=204)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usage_stats(request):
    from django.utils import timezone
    from datetime import timedelta
    today = timezone.now().date()
    week_start = today - timedelta(days=7)
    
    total      = TranscriptionRecord.objects.filter(user=request.user).count()
    today_count= TranscriptionRecord.objects.filter(user=request.user, created_at__date=today).count()
    week_count = TranscriptionRecord.objects.filter(user=request.user, created_at__date__gte=week_start).count()
    tts_count  = TranscriptionRecord.objects.filter(user=request.user, type='tts').count()
    stt_count  = TranscriptionRecord.objects.filter(user=request.user, type='stt').count()
    
    return Response({
        'total': total,
        'today': today_count,
        'this_week': week_count,
        'tts': tts_count,
        'stt': stt_count,
        'username': request.user.username,
        'email': request.user.email,
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    username = request.data.get('username', '').strip()
    email    = request.data.get('email', '').strip()
    password = request.data.get('password', '').strip()
    bio      = request.data.get('bio', '').strip()

    if username: user.username = username
    if email:    user.email    = email
    if password and len(password) >= 6:
        user.set_password(password)

    user.save()
    return Response({
        'message': 'Profile updated.',
        'username': user.username,
        'email': user.email,
    })