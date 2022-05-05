import asyncio


def background(f):
    loop = asyncio.get_event_loop()

    def wrapped(*args, **kwargs):
        return loop.run_in_executor(None, f, *args, **kwargs)

    return wrapped
