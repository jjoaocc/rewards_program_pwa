import importlib
import os


def _build_app_with_root_path(root_path: str):
    os.environ["ROOT_PATH"] = root_path
    try:
        from app.core import config as config_module

        importlib.reload(config_module)

        from app import main as main_module

        importlib.reload(main_module)
        return main_module.app
    finally:
        del os.environ["ROOT_PATH"]


def test_health_check(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "rewards-api"}


def test_openapi_reflects_root_path():
    from fastapi.testclient import TestClient

    app = _build_app_with_root_path("/rewards")
    with TestClient(app) as test_client:
        response = test_client.get("/api/v1/openapi.json")

    assert response.status_code == 200
    assert response.json()["servers"] == [{"url": "/rewards"}]


def test_openapi_default_root_path_is_unchanged():
    from fastapi.testclient import TestClient

    app = _build_app_with_root_path("")
    with TestClient(app) as test_client:
        response = test_client.get("/api/v1/openapi.json")

    assert response.status_code == 200
    assert "servers" not in response.json()
