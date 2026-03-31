#!/bin/sh
set -e

python wait_for_db.py
python manage.py migrate --noinput
python manage.py seed_data
python manage.py runserver 0.0.0.0:8000
