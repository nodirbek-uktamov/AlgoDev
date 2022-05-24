#!/bin/sh
git pull
python3 backend/manage.py migrate
systemctl restart gunicorn
systemctl restart celery
systemctl restart nginx
systemctl restart bot
cd frontend && npm run build
