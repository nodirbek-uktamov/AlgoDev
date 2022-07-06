from random import randint


def random_array(total_sum, count, min_value=0, decimal_fields=0):
    numbers = []

    for i in range(count):
        numbers.append(randint(80, 120))

    normalised = []

    for n in numbers:
        normalised.append(round(n / sum(numbers) * total_sum, decimal_fields))

    normalised[-1] += total_sum - sum(normalised)

    return []
