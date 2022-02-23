from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError
import time


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        db_conn = None
        seconds = 1

        self.stdout.write(f"Waiting for database")

        while not db_conn:
            try:
                db_conn = connections['default'].cursor()
                self.stdout.write(self.style.SUCCESS('Database is available now'))

            except OperationalError as e:
                if seconds > 15:
                    raise e

                self.stdout.write(f"Database is unavailable, waiting {seconds} seconds ...")
                seconds += 1
                time.sleep(1)
