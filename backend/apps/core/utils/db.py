from django.db import connection
from django.db.models import Func, IntegerField


class NaturalOrder(Func):
    name = 'NaturalOrder'
    template = "SUBSTRING(%(expressions)s FROM '^[0-9]+')::INT"
    output_field = IntegerField()


def dict_fetch_one(cursor):
    columns = [column[0] for column in cursor.description]
    return dict(zip(columns, cursor.fetchone()))


def dict_fetch(cursor):
    columns = [column[0] for column in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def raw_sql(sql, **kwargs):
    with connection.cursor() as cursor:
        cursor.execute(sql, kwargs)
        return dict_fetch(cursor)


def raw_sql_one(sql, **kwargs):
    with connection.cursor() as cursor:
        cursor.execute(sql, kwargs)
        return dict_fetch_one(cursor)
