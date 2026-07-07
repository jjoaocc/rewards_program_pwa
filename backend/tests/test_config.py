from app.core.config import Settings, get_settings
from app.main import app


def test_get_settings_override_affects_admin_secret_check(client, make_customer):
    customer = make_customer()

    def _fake_settings():
        return Settings(
            DATABASE_URL="postgresql+psycopg://x:x@localhost/x",
            SECRET_KEY="x",
            PUSH_ADMIN_SECRET="secret-diferente-via-override",
        )

    app.dependency_overrides[get_settings] = _fake_settings
    try:
        response = client.post(
            "/api/v1/push/send",
            json={"customer_id": customer.id, "title": "x", "message": "x", "url": "/"},
            headers={"X-Admin-Secret": "secret-diferente-via-override"},
        )
        assert response.status_code == 200
    finally:
        del app.dependency_overrides[get_settings]
