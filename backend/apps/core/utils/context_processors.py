from config.settings import DEBUG


def custom(request):
    return {'is_debug': DEBUG}
