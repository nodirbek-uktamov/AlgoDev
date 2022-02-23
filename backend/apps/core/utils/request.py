def nullable_list(array):
    return list(map(lambda i: i if i != 'null' else None, array))


def get_boolean(value):
    return value not in ('false', None, 0, 'False', '0')
