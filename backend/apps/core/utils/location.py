import json


def location_field(location):
    """ translate location format to google maps format """

    if not location:
        return

    return {
        'lng': location['longitude'],
        'lat': location['latitude']
    }
