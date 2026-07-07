# Hash gerado pela implementação anterior baseada em passlib, para a senha "tmx".
# Fixado aqui para garantir que a migração para bcrypt puro não invalida senhas
# já existentes em produção (mesmo formato $2b$... nas duas libs).
_LEGACY_PASSLIB_HASH_FOR_TMX = "$2b$12$/0Hrtlnwhy10FuNEZaYQaeqhmcvROR/XiyWXsiP.PM8BUFwL8bqtm"


def test_hash_and_verify_roundtrip():
    from app.core.security import get_password_hash, verify_password

    hashed = get_password_hash("minha-senha-forte")

    assert verify_password("minha-senha-forte", hashed)


def test_verify_fails_for_wrong_password():
    from app.core.security import get_password_hash, verify_password

    hashed = get_password_hash("minha-senha-forte")

    assert not verify_password("senha-errada", hashed)


def test_verify_accepts_hash_generated_by_previous_passlib_implementation():
    from app.core.security import verify_password

    assert verify_password("tmx", _LEGACY_PASSLIB_HASH_FOR_TMX)
    assert not verify_password("senha-errada", _LEGACY_PASSLIB_HASH_FOR_TMX)


def test_verify_returns_false_instead_of_raising_for_password_over_72_bytes():
    """bcrypt.checkpw levanta ValueError pra senha >72 bytes (diferente do passlib
    antigo, que truncava em silêncio) — verify_password precisa absorver isso e
    tratar como senha incorreta, não deixar a exceção estourar até o endpoint."""
    from app.core.security import get_password_hash, verify_password

    hashed = get_password_hash("senha-normal")
    senha_longa = "a" * 100

    assert not verify_password(senha_longa, hashed)


def test_create_and_decode_admin_token_roundtrip():
    from app.core.security import create_admin_token, decode_admin_token

    token = create_admin_token()

    assert decode_admin_token(token) is True


def test_decode_admin_token_rejects_a_customer_token():
    """Um JWT normal de cliente (sem role=admin) não pode ser aceito como token de admin."""
    from app.core.security import create_access_token, decode_admin_token

    customer_token = create_access_token(data={"sub": "7742"})

    assert decode_admin_token(customer_token) is False


def test_decode_admin_token_rejects_garbage():
    from app.core.security import decode_admin_token

    assert decode_admin_token("token-invalido") is False


def test_decode_admin_token_rejects_expired_token():
    from datetime import timedelta

    from app.core.security import create_admin_token, decode_admin_token

    expired = create_admin_token(expires_delta=timedelta(seconds=-1))

    assert decode_admin_token(expired) is False
