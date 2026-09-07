from datetime import timedelta

from jose import jwt

from app.core.config import settings
from app.core.security import PasswordHasher, TokenService


# --- PasswordHasher ---

def test_hash_and_verify_correct_password():
    hasher = PasswordHasher()
    hashed = hasher.hash("mypassword123")

    assert hashed != "mypassword123"          # never stored in plain text
    assert hasher.verify("mypassword123", hashed) is True


def test_verify_rejects_wrong_password():
    hasher = PasswordHasher()
    hashed = hasher.hash("mypassword123")

    assert hasher.verify("wrongpassword", hashed) is False


def test_same_password_produces_different_hashes():
    hasher = PasswordHasher()
    hash1 = hasher.hash("mypassword123")
    hash2 = hasher.hash("mypassword123")

    assert hash1 != hash2  # proves salting is working


# --- TokenService ---

def test_create_and_decode_token_round_trip():
    service = TokenService()
    token = service.create_access_token(subject="42")

    result = service.decode_access_token(token)
    assert result == "42"


def test_decode_rejects_invalid_token():
    service = TokenService()
    result = service.decode_access_token("this.is.not.a.valid.token")

    assert result is None


def test_decode_rejects_expired_token():
    service = TokenService()

    # Manually build a token that's already expired, bypassing the
    # service's own expiry logic, so we can test the expired path directly.
    from datetime import datetime, timezone
    expired_payload = {
        "sub": "42",
        "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
    }
    expired_token = jwt.encode(expired_payload, settings.secret_key, algorithm=settings.algorithm)

    result = service.decode_access_token(expired_token)
    assert result is None


def test_decode_rejects_token_signed_with_wrong_key():
    service = TokenService()
    token_signed_by_someone_else = jwt.encode(
        {"sub": "42"}, "a-completely-different-secret-key", algorithm=settings.algorithm
    )

    result = service.decode_access_token(token_signed_by_someone_else)
    assert result is None


# commmand to run this test file:
# pytest tests/unit/test_security.py -v
# Run this test file from backend directory