import io
import os
import shutil
from uuid import uuid4

from PIL import Image
from django.utils.deconstruct import deconstructible
from rest_framework.exceptions import ValidationError


@deconstructible
class FilePath(object):
    def __init__(self, sub_path, custom_name=None):
        self.path = sub_path
        self.custom_name = custom_name

    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        filename = '{}.{}'.format(self.custom_name if self.custom_name else uuid4().hex, ext)
        return os.path.join(self.path.format(**instance.__dict__), filename)


def file_path(folder, custom_name=''):
    return FilePath(os.path.join(folder, custom_name))


def delete_file(path):
    if os.path.exists(path):
        os.remove(path)


def test_file(name='test.png', extension='png'):
    file = io.BytesIO()
    image = Image.new('RGBA', size=(100, 100), color=(155, 0, 0))
    image.save(file, extension)
    file.name = name
    file.seek(0)
    return file


def clear_uploads():
    uploads = './uploads'
    if os.path.exists(uploads) and os.path.isdir(uploads):
        shutil.rmtree(uploads)


def size_1mb(value):
    if value.size > 5242880:
        raise ValidationError("The maximum file size that can be uploaded is 1 MB")
    return value
