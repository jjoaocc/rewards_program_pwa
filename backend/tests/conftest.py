import os

from testcontainers.postgres import PostgresContainer

_postgres = PostgresContainer("postgres:15-alpine", driver="psycopg")
_postgres.start()

os.environ["DATABASE_URL"] = _postgres.get_connection_url()
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest")
os.environ.setdefault("PUSH_ADMIN_SECRET", "test-admin-secret")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import event  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app import models  # noqa: E402, F401 garante que todos os models registram em Base.metadata
from app.api.deps import get_db  # noqa: E402
from app.core.database import Base, engine  # noqa: E402
from app.core.limiter import limiter  # noqa: E402
from app.main import app  # noqa: E402

Base.metadata.create_all(bind=engine)


def pytest_sessionfinish(session, exitstatus):
    _postgres.stop()


@pytest.fixture(autouse=True)
def _reset_rate_limiter():
    limiter.reset()
    yield


@pytest.fixture()
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=connection)
    session = testing_session_local()

    nested = connection.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def _restart_savepoint(sess, trans):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db_session):
    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def make_customer(db_session):
    from app.models import Customer

    counter = {"n": 0}

    def _make(**overrides):
        counter["n"] += 1
        defaults = {
            "id": f"C{counter['n']:04d}",
            "name": f"Cliente Teste {counter['n']}",
            "email": f"cliente{counter['n']}@example.com",
            "password_hash": "x",
            "document": f"{counter['n']:011d}",
            "document_type": "cpf",
        }
        defaults.update(overrides)
        customer = Customer(**defaults)
        db_session.add(customer)
        db_session.commit()
        return customer

    return _make


@pytest.fixture()
def auth_headers():
    from app.core.security import create_access_token

    def _headers(customer_id: str):
        token = create_access_token(data={"sub": customer_id})
        return {"Authorization": f"Bearer {token}"}

    return _headers
