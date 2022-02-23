import re


def cut(text, chars=50, end='...'):
    """ Get first n symbols without braking the last word and join '...' """

    length = len(text)
    result = ''

    if length <= chars:
        return text

    for word in text.split():
        temp = result.strip() + ' ' + word
        temp_len = len(temp)

        if temp_len >= chars:
            return result + end
        else:
            result = temp


def parse_integer(text):
    return ''.join(x for x in text if x.isdigit())


def remove_emoji(text):
    emoji_pattern = re.compile("["
                               u"\U0001F600-\U0001F64F"
                               u"\U0001F300-\U0001F5FF"
                               u"\U0001F680-\U0001F6FF"
                               u"\U0001F1E0-\U0001F1FF"
                               u"\U00002500-\U00002BEF"
                               u"\U00002702-\U000027B0"
                               u"\U00002702-\U000027B0"
                               u"\U000024C2-\U0001F251"
                               u"\U0001f926-\U0001f937"
                               u"\U00010000-\U0010ffff"
                               u"\u2640-\u2642"
                               u"\u2600-\u2B55"
                               u"\u200d"
                               u"\u23cf"
                               u"\u23e9"
                               u"\u231a"
                               u"\ufe0f"
                               u"\u3030"
                               "]+", flags=re.UNICODE)
    return emoji_pattern.sub(r'', text)
