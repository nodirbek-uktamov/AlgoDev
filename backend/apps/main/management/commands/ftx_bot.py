from django.core.management.base import BaseCommand
from core.exchange.ftx_bot import FTXBot


class Command(BaseCommand, FTXBot):
    help = 'run ftx bot'

    def handle(self, *args, **options):
        self.run()
