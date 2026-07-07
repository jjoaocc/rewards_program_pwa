import importlib

from app.core.config import settings


def test_import_database_module_does_not_raise():
    module = importlib.import_module("app.core.database")
    importlib.reload(module)


def test_engine_echo_matches_debug_setting():
    from app.core.database import engine

    assert engine.echo == settings.DEBUG
