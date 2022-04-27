from cryptography.fernet import Fernet


def generate_key():
    return Fernet.generate_key().decode('utf-8')


def decode(key, value):
    f = Fernet(str.encode(key))
    return f.encrypt(str.encode(value or '')).decode("utf-8")


def encode(key, value):
    f = Fernet(str.encode(key))
    return f.decrypt(str.encode(value or '')).decode("utf-8")
