MAX_PAGE_SIZE = 100


def clamp_limit(limit: int) -> int:
    return min(limit, MAX_PAGE_SIZE)
