git pull
python3 backend/manage.py migrate
systemctl restart gunicorn
systemctl restart celery
systemctl restart nginx
systemctl restart huobi_bot
systemctl restart ftx_bot
cd frontend && npm run build
