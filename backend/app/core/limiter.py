from slowapi import Limiter
from starlette.requests import Request


def get_client_ip(request: Request) -> str:
    """Extrai o IP real do cliente do header X-Forwarded-For.

    O backend só é alcançável via a rede Docker do Nginx Proxy Manager (sem porta
    publicada — ver docker-compose.yml), então esse header só pode ter sido setado
    pelo proxy, e confiar nele aqui é seguro. Sem isso, `get_remote_address` (via
    request.client.host) sempre veria o IP do container do proxy, e todo cliente real
    cairia no mesmo bucket de rate limit.
    """
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=get_client_ip)
