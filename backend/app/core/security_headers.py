from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

_BASE_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
}

# Endpoints de documentação (Swagger/Redoc) carregam assets de um CDN externo,
# então não recebem o CSP restritivo — o resto da API é JSON puro e não precisa
# executar nenhum script/estilo de origem alguma. Usa substring (não endswith) pra
# cobrir também páginas auxiliares como /docs/oauth2-redirect, não só o path exato.
_DOCS_MARKERS = ("/docs", "/redoc")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        for header, value in _BASE_HEADERS.items():
            response.headers[header] = value

        path = request.url.path
        is_docs = path.endswith("/openapi.json") or any(marker in path for marker in _DOCS_MARKERS)
        if not is_docs:
            response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"

        return response
