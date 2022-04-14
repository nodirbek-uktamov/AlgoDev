from random import uniform


def integers_only(text) -> str:
    """
    Removes all symbols except integers
    ex: +998(91) 333 33 33 -> 998913333333
    """
    return ''.join(x for x in text if x.isdigit())


def random_array(sum, count, min_value=0, decimal_fields=5):
    result = []

    for i in range(1, count + 1, 3):
        min_value_array = [min_value, min_value, min_value]

        if isinstance(min_value, list):
            min_value_array = min_value[(i - 1):]

        nums_count = 3

        if count - i < 3:
            nums_count = count + 1 - i

        values_sum = sum / count * nums_count
        avg_val = round(sum / count, decimal_fields)

        val_1 = round(uniform(max(min_value_array[0], avg_val * 0.7), min(avg_val * 1.3, sum / count)), decimal_fields)

        if nums_count == 1:
            val_1 = values_sum
            result.append(val_1)

        elif nums_count == 2:
            val_2 = values_sum - val_1
            result.append(round(val_1, decimal_fields))
            result.append(round(val_2, decimal_fields))
        else:
            values_sum -= val_1
            avg_val = values_sum / 2
            val_2 = round(uniform(max(min_value_array[2], avg_val * 0.7), min(avg_val * 1.3, sum / count)), decimal_fields)
            val_3 = round(values_sum - val_2, decimal_fields)
            result.append(val_1)
            result.append(val_2)
            result.append(val_3)

    return result
