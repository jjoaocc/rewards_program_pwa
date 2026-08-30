from app.adapters.db.notification_repository import SqlAlchemyNotificationRepository
from app.models import Customer, Notification


def _make_customer(db_session, **overrides):
    defaults = {
        "id": "C0001",
        "name": "Cliente Teste",
        "email": "cliente@example.com",
        "password_hash": "x",
        "document": "12345678900",
        "document_type": "cpf",
    }
    defaults.update(overrides)
    customer = Customer(**defaults)
    db_session.add(customer)
    db_session.commit()
    return customer


def test_list_for_customer_unread_only_excludes_read(db_session):
    customer = _make_customer(db_session)
    db_session.add(Notification(customer_id=customer.id, title="Lida", message="m", type="system", read=True))
    db_session.add(Notification(customer_id=customer.id, title="Não lida", message="m", type="system", read=False))
    db_session.commit()
    repo = SqlAlchemyNotificationRepository(db_session)

    result = repo.list_for_customer(customer.id, unread_only=True)

    assert [n.title for n in result] == ["Não lida"]


def test_mark_as_read_only_affects_the_given_customer(db_session):
    customer = _make_customer(db_session)
    other = _make_customer(db_session, id="C0002", email="outro@example.com", document="99999999999")
    mine = Notification(customer_id=customer.id, title="Minha", message="m", type="system", read=False)
    theirs = Notification(customer_id=other.id, title="Deles", message="m", type="system", read=False)
    db_session.add_all([mine, theirs])
    db_session.commit()
    repo = SqlAlchemyNotificationRepository(db_session)

    result = repo.mark_as_read(customer.id, [str(mine.id), str(theirs.id)])

    assert len(result) == 1
    assert result[0].read is True


def test_delete_returns_false_for_another_customers_notification(db_session):
    customer = _make_customer(db_session)
    other = _make_customer(db_session, id="C0002", email="outro@example.com", document="99999999999")
    theirs = Notification(customer_id=other.id, title="Deles", message="m", type="system", read=False)
    db_session.add(theirs)
    db_session.commit()
    repo = SqlAlchemyNotificationRepository(db_session)

    result = repo.delete(customer.id, str(theirs.id))

    assert result is False


def test_create_persists_and_returns_the_domain_notification(db_session):
    customer = _make_customer(db_session)
    repo = SqlAlchemyNotificationRepository(db_session)

    result = repo.create(customer.id, "Título", "Mensagem", action_url="https://example.com")

    assert result.customer_id == customer.id
    assert result.action_url == "https://example.com"
    assert result.read is False
