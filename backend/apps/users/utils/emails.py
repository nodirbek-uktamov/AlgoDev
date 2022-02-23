from django.conf import settings
from django.template.loader import render_to_string


def send_verification_email(request, user):
    url = f'{settings.FRONTEND_DOMAIN}/confirm/{user.confirmation_code}'
    text = render_to_string('confirm_email.html', {'user': user, 'url': url}, request)
    user.email_user(f"Активация аккаунта {settings.COMPANY_NAME}", text, html_message=text)


def send_message_email(title, body, user):
    user.email_user(title, body)


def send_reset_link_email(request, reset, user):
    url = f'{settings.FRONTEND_DOMAIN}/reset-password/{reset.key}'
    text = render_to_string('reset_password.html', {'user': user, 'url': url}, request)
    user.email_user(f'Восстановить пароль, {settings.COMPANY_NAME}', text, html_message=text)
