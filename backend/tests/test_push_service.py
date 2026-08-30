import uuid
from datetime import datetime
from types import SimpleNamespace

from pywebpush import WebPushException

from app.core.push import send_push_to_subscriptions
from app.domain.push import PushSubscription


def _make_subscription(endpoint: str = "https://push.example.com/abc") -> PushSubscription:
    return PushSubscription(
        id=uuid.uuid4(),
        customer_id="C0001",
        endpoint=endpoint,
        p256dh="p256dh-key",
        auth="auth-key",
        user_agent=None,
        created_at=datetime.now(),
    )


def test_send_push_to_subscriptions_with_no_subscriptions_does_nothing():
    result = send_push_to_subscriptions([], "Título", "Mensagem", "/")

    assert result == {"sent": 0, "failed": 0, "removed": 0, "removed_ids": []}


def test_send_push_to_subscriptions_counts_successful_send(monkeypatch):
    sub = _make_subscription()
    monkeypatch.setattr("app.core.push.webpush", lambda **kwargs: None)

    result = send_push_to_subscriptions([sub], "Título", "Mensagem", "/")

    assert result == {"sent": 1, "failed": 0, "removed": 0, "removed_ids": []}


def test_send_push_to_subscriptions_reports_removed_id_on_410_expired(monkeypatch):
    sub = _make_subscription()

    def _raise_expired(**kwargs):
        raise WebPushException("expired", response=SimpleNamespace(status_code=410))

    monkeypatch.setattr("app.core.push.webpush", _raise_expired)

    result = send_push_to_subscriptions([sub], "Título", "Mensagem", "/")

    assert result == {"sent": 0, "failed": 0, "removed": 1, "removed_ids": [sub.id]}


def test_send_push_to_subscriptions_counts_failure_on_other_errors_without_removing(monkeypatch):
    sub = _make_subscription()

    def _raise_server_error(**kwargs):
        raise WebPushException("boom", response=SimpleNamespace(status_code=500))

    monkeypatch.setattr("app.core.push.webpush", _raise_server_error)

    result = send_push_to_subscriptions([sub], "Título", "Mensagem", "/")

    assert result == {"sent": 0, "failed": 1, "removed": 0, "removed_ids": []}


def test_send_push_to_subscriptions_counts_failure_on_network_error_instead_of_crashing(monkeypatch):
    """Uma falha de rede (timeout, DNS, conexão recusada) não é um WebPushException — antes
    dessa correção, ela não era capturada e derrubava a requisição inteira com 500 em vez
    de contar como falha e seguir tentando as próximas subscriptions."""
    sub = _make_subscription()

    def _raise_connection_error(**kwargs):
        raise ConnectionError("Failed to resolve push service host")

    monkeypatch.setattr("app.core.push.webpush", _raise_connection_error)

    result = send_push_to_subscriptions([sub], "Título", "Mensagem", "/")

    assert result == {"sent": 0, "failed": 1, "removed": 0, "removed_ids": []}


def test_send_push_to_subscriptions_accepts_an_injected_fake_sender_without_monkeypatch():
    """Demonstra a porta WebPushSender: dá pra testar sem monkeypatch em app.core.push.webpush."""
    sub = _make_subscription()
    calls = []

    def fake_sender(*, subscription_info, data, vapid_private_key, vapid_claims):
        calls.append(subscription_info)

    result = send_push_to_subscriptions([sub], "Título", "Mensagem", "/", sender=fake_sender)

    assert result == {"sent": 1, "failed": 0, "removed": 0, "removed_ids": []}
    assert len(calls) == 1
