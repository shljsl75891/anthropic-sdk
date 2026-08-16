def calculate_average(numbers):
    numbers = list(numbers)
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)


def get_user_name(user):
    if not user:
        return ""
    name = user.get("name")
    if not name:
        return ""
    return str(name).upper()
