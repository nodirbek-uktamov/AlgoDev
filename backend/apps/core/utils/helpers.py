from datetime import timedelta
import calendar
from django.utils import timezone


def integers_only(text) -> str:
    """
    Removes all symbols except integers
    ex: +998(91) 333 33 33 -> 998913333333
    """
    return ''.join(x for x in text if x.isdigit())
