from types import SimpleNamespace

from pywebpush import WebPushException

from app.core.push import send_push_to_customer
from app.models import PushSubscription


def _make_subscription(db_session, customer, endpoint="https://push.example.com/abc"):
    sub = PushSubscription(
        customer_id=customer.id,
        endpoint=endpoint,
        p256dh="p256dh-key",
        auth="auth-key",
    )
    db_session.add(sub)
    db_session.commit()
    return sub


def test_send_push_to_customer_with_no_subscriptions_does_nothing(db_session, make_customer):
    customer = make_customer()

    result = send_push_to_customer(customer.id, "Título", "Mensagem", "/", db_session)

    assert result == {"sent": 0, "failed": 0, "removed": 0}


def test_send_push_to_customer_counts_successful_send(monkeypatch, db_session, make_customer):
    customer = make_customer()
    _make_subscription(db_session, customer)

    monkeypatch.setattr("app.core.push.webpush", lambda **kwargs: None)

    result = send_push_to_customer(customer.id, "Título", "Mensagem", "/", db_session)

    assert result == {"sent": 1, "failed": 0, "removed": 0}


def test_send_push_to_customer_removes_subscription_on_410_expired(monkeypatch, db_session, make_customer):
    customer = make_customer()
    sub = _make_subscription(db_session, customer)

    def _raise_expired(**kwargs):
        raise WebPushException("expired", response=SimpleNamespace(status_code=410))

    monkeypatch.setattr("app.core.push.webpush", _raise_expired)

    result = send_push_to_customer(customer.id, "Título", "Mensagem", "/", db_session)

    assert result == {"sent": 0, "failed": 0, "removed": 1}
    assert db_session.query(PushSubscription).filter(PushSubscription.id == sub.id).first() is None


def test_send_push_to_customer_counts_failure_on_other_errors_without_removing(monkeypatch, db_session, make_customer):
    customer = make_customer()
    sub = _make_subscription(db_session, customer)

    def _raise_server_error(**kwargs):
        raise WebPushException("boom", response=SimpleNamespace(status_code=500))

    monkeypatch.setattr("app.core.push.webpush", _raise_server_error)

    result = send_push_to_customer(customer.id, "Título", "Mensagem", "/", db_session)

    assert result == {"sent": 0, "failed": 1, "removed": 0}
    assert db_session.query(PushSubscription).filter(PushSubscription.id == sub.id).first() is not None


def test_send_push_to_customer_counts_failure_on_network_error_instead_of_crashing(
    monkeypatch, db_session, make_customer
):
    """Uma falha de rede (timeout, DNS, conexão recusada) não é um WebPushException — antes
    dessa correção, ela não era capturada e derrubava a requisição inteira com 500 em vez
    de contar como falha e seguir tentando as próximas subscriptions."""
    customer = make_customer()
    sub = _make_subscription(db_session, customer)

    def _raise_connection_error(**kwargs):
        raise ConnectionError("Failed to resolve push service host")

    monkeypatch.setattr("app.core.push.webpush", _raise_connection_error)

    result = send_push_to_customer(customer.id, "Título", "Mensagem", "/", db_session)

    assert result == {"sent": 0, "failed": 1, "removed": 0}
    assert db_session.query(PushSubscription).filter(PushSubscription.id == sub.id).first() is not None


def test_send_push_to_customer_accepts_an_injected_fake_sender_without_monkeypatch(db_session, make_customer):
    """Demonstra a porta WebPushSender: dá pra testar sem monkeypatch em app.core.push.webpush."""
    customer = make_customer()
    _make_subscription(db_session, customer)

    calls = []

    def fake_sender(*, subscription_info, data, vapid_private_key, vapid_claims):
        calls.append(subscription_info)

    result = send_push_to_customer(customer.id, "Título", "Mensagem", "/", db_session, sender=fake_sender)

    assert result == {"sent": 1, "failed": 0, "removed": 0}
    assert len(calls) == 1
