def test_login_is_rate_limited_after_too_many_attempts(client):
    payload = {"identifier": "does-not-exist", "password": "wrong"}

    for _ in range(5):
        response = client.post("/api/v1/auth/login", json=payload)
        assert response.status_code == 401

    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 429


def test_rate_limit_is_scoped_per_client_ip_from_x_forwarded_for(client):
    """O backend só é alcançável via a rede Docker do Nginx Proxy Manager (sem porta
    publicada), então o X-Forwarded-For que ele repassa é confiável. Sem usar esse
    header, todo mundo cairia no mesmo bucket (o IP do proxy), e o limite de um
    cliente afetaria todos os outros."""
    payload = {"identifier": "does-not-exist", "password": "wrong"}

    for _ in range(5):
        response = client.post("/api/v1/auth/login", json=payload, headers={"X-Forwarded-For": "1.1.1.1"})
        assert response.status_code == 401

    blocked = client.post("/api/v1/auth/login", json=payload, headers={"X-Forwarded-For": "1.1.1.1"})
    assert blocked.status_code == 429

    unaffected = client.post("/api/v1/auth/login", json=payload, headers={"X-Forwarded-For": "2.2.2.2"})
    assert unaffected.status_code == 401
