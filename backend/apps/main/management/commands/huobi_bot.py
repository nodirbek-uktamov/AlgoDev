from django.core.management.base import BaseCommand
from core.exchange.huobi_bot import HuobiBot


class Command(BaseCommand, HuobiBot):
    help = 'run huobi bot'

    def handle(self, *args, **options):
        self.run()
