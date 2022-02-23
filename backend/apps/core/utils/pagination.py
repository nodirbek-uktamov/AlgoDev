
def pagination(queryset, serializer, page, size=15):
    serializer.instance = pagination_queryset(queryset, page, size)['queryset']
    return {'count': queryset.count(), 'results': serializer.data}


def pagination_queryset(queryset, page, size=15):
    page = page or 1
    offset = (page - 1) * size
    limit = offset + size
    return {'queryset': queryset[offset:limit], 'limit': limit, 'offset': offset}
