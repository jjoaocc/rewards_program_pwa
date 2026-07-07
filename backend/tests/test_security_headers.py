def test_response_includes_security_headers(client):
    response = client.get("/health")

    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert "content-security-policy" in response.headers


def test_docs_page_is_exempt_from_restrictive_csp(client):
    response = client.get("/docs")

    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert "content-security-policy" not in response.headers


def test_docs_oauth2_redirect_page_is_also_exempt_from_restrictive_csp(client):
    """`endswith(("/docs", ...))` não cobre /docs/oauth2-redirect — só o path exato
    /docs escapava do CSP restritivo, quebrando essa página auxiliar do Swagger."""
    response = client.get("/docs/oauth2-redirect")

    assert "content-security-policy" not in response.headers
