#!/usr/bin/env bash
set -o errexit

# Install ffmpeg
apt-get update && apt-get install -y ffmpeg

# Install Python dependencies
pip install -r requirements.txt

# Build React frontend
cd frontend
npm install
export CI=false
npm run build
cd ..

# Django setup
python manage.py collectstatic --noinput
python manage.py migrate