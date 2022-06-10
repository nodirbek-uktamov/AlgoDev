from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import transaction
from core.utils import hash


class Command(BaseCommand):
    help = 'Loads all fixtures'

    @transaction.atomic
    def handle(self, *args, **options):
        print(hash.generate_key())
