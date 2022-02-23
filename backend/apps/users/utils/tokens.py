import os
import binascii


def generate():
    return binascii.hexlify(os.urandom(20)).decode()
