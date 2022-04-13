from django.core.management.base import BaseCommand
from core.utils.exchange import Bot


class Command(BaseCommand, Bot):
    help = 'Bot'

    def handle(self, *args, **options):
        self.run_bot()
