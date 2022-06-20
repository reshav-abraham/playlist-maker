import random

def generate_random_string(string_length):
    def get_random_char(n):
        # random.randint(97, 122) a-z
        # random.randint(49, 57) 1-9
        # random.randint(65, 90) A-Z
        ascii_value = [random.randint(97, 122), random.randint(49, 57), random.randint(65, 90)][n]
        return chr(ascii_value)
    return "".join(iter(map(lambda x:get_random_char(random.randint(0,2)), range(string_length))))