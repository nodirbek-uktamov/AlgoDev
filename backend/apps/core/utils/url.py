from config.settings import USE_HTTPS


def absolute_url(request, path):
    if USE_HTTPS:
        return 'https://' + request.get_host().split(':')[0] + path
    return request.build_absolute_uri(path)
