import io
import uuid
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.core.config import settings
from app.core.database import SessionLocal
from app.main import app
from app.models.user import User

client = TestClient(app)


# ---------- Helpers & fixtures ----------

def _register_and_login():
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "mypassword123"
    client.post(
        "/api/v1/auth/register",
        json={"fullname": "Test User", "email": email, "password": password},
    )
    login = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    token = login.json()["access_token"]
    return {"email": email, "headers": {"Authorization": f"Bearer {token}"}}


def _cleanup(email: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user:
        db.delete(user)
        db.commit()
    db.close()


@pytest.fixture()
def user_a():
    data = _register_and_login()
    yield data
    _cleanup(data["email"])


def _make_image_bytes(fmt="JPEG", size=(800, 600), color=(255, 0, 0)) -> bytes:
    """Builds a real, valid in-memory image — this is what a browser/React
    would actually send from a <input type='file'> selection."""
    image = Image.new("RGB", size, color)
    buffer = io.BytesIO()
    image.save(buffer, format=fmt)
    return buffer.getvalue()


def _avatar_disk_path(avatar_url: str) -> Path:
    filename = avatar_url.rsplit("/", 1)[-1]
    return Path(settings.UPLOAD_DIR) / filename


# ---------- Upload ----------

class TestUploadAvatar:
    def test_upload_requires_auth(self):
        files = {"file": ("avatar.jpg", _make_image_bytes(), "image/jpeg")}
        response = client.post("/api/v1/users/me/avatar", files=files)
        assert response.status_code == 401

    def test_upload_valid_jpeg_succeeds(self, user_a):
        files = {"file": ("avatar.jpg", _make_image_bytes("JPEG"), "image/jpeg")}
        response = client.post(
            "/api/v1/users/me/avatar", headers=user_a["headers"], files=files
        )

        assert response.status_code == 200
        body = response.json()
        assert body["avatar_url"] is not None
        assert body["avatar_url"].startswith(settings.AVATAR_URL_PREFIX)

    def test_upload_valid_png_succeeds(self, user_a):
        files = {"file": ("avatar.png", _make_image_bytes("PNG"), "image/png")}
        response = client.post(
            "/api/v1/users/me/avatar", headers=user_a["headers"], files=files
        )
        assert response.status_code == 200
        assert response.json()["avatar_url"] is not None

    def test_uploaded_avatar_persists_on_get_me(self, user_a):
        files = {"file": ("avatar.jpg", _make_image_bytes(), "image/jpeg")}
        upload = client.post(
            "/api/v1/users/me/avatar", headers=user_a["headers"], files=files
        ).json()

        me = client.get("/api/v1/users/me", headers=user_a["headers"]).json()
        assert me["avatar_url"] == upload["avatar_url"]

    def test_uploaded_file_is_actually_servable(self, user_a):
        """Confirms the URL React would put into an <img src=...> tag
        actually resolves to a real, fetchable file — not just a DB value."""
        files = {"file": ("avatar.jpg", _make_image_bytes(), "image/jpeg")}
        upload = client.post(
            "/api/v1/users/me/avatar", headers=user_a["headers"], files=files
        ).json()

        static_response = client.get(upload["avatar_url"])
        assert static_response.status_code == 200
        assert static_response.headers["content-type"] in ("image/webp", "application/octet-stream")

    def test_uploaded_image_is_resized_and_converted_to_webp(self, user_a):
        # Upload something much larger than the 512px cap
        files = {"file": ("big.jpg", _make_image_bytes("JPEG", size=(2000, 1500)), "image/jpeg")}
        upload = client.post(
            "/api/v1/users/me/avatar", headers=user_a["headers"], files=files
        ).json()

        disk_path = _avatar_disk_path(upload["avatar_url"])
        with Image.open(disk_path) as saved_image:
            assert saved_image.format == "WEBP"
            assert max(saved_image.size) <= 512

    def test_upload_rejects_wrong_file_type(self, user_a):
        files = {"file": ("notes.txt", b"just some text, not an image", "text/plain")}
        response = client.post(
            "/api/v1/users/me/avatar", headers=user_a["headers"], files=files
        )
        assert response.status_code == 422

    def test_upload_rejects_fake_image_with_spoofed_content_type(self, user_a):
        """Proves validation checks real file content, not just the
        claimed Content-Type header — a client could lie about this."""
        files = {"file": ("fake.jpg", b"this is not actually image data", "image/jpeg")}
        response = client.post(
            "/api/v1/users/me/avatar", headers=user_a["headers"], files=files
        )
        assert response.status_code == 422

    def test_upload_rejects_oversized_file(self, user_a):
        oversized = b"\x00" * (6 * 1024 * 1024)  # 6 MB, over the 5 MB limit
        files = {"file": ("huge.jpg", oversized, "image/jpeg")}
        response = client.post(
            "/api/v1/users/me/avatar", headers=user_a["headers"], files=files
        )
        assert response.status_code == 422

    def test_replacing_avatar_deletes_old_file_from_disk(self, user_a):
        files_1 = {"file": ("first.jpg", _make_image_bytes(color=(255, 0, 0)), "image/jpeg")}
        first_upload = client.post(
            "/api/v1/users/me/avatar", headers=user_a["headers"], files=files_1
        ).json()
        old_path = _avatar_disk_path(first_upload["avatar_url"])
        assert old_path.exists()

        files_2 = {"file": ("second.jpg", _make_image_bytes(color=(0, 255, 0)), "image/jpeg")}
        second_upload = client.post(
            "/api/v1/users/me/avatar", headers=user_a["headers"], files=files_2
        ).json()

        assert second_upload["avatar_url"] != first_upload["avatar_url"]
        assert not old_path.exists()  # old file cleaned up
        assert _avatar_disk_path(second_upload["avatar_url"]).exists()  # new file present


# ---------- Remove ----------

class TestRemoveAvatar:
    def test_remove_requires_auth(self):
        response = client.delete("/api/v1/users/me/avatar")
        assert response.status_code == 401

    def test_remove_clears_avatar_and_deletes_file(self, user_a):
        files = {"file": ("avatar.jpg", _make_image_bytes(), "image/jpeg")}
        upload = client.post(
            "/api/v1/users/me/avatar", headers=user_a["headers"], files=files
        ).json()
        disk_path = _avatar_disk_path(upload["avatar_url"])
        assert disk_path.exists()

        response = client.delete("/api/v1/users/me/avatar", headers=user_a["headers"])

        assert response.status_code == 200
        assert response.json()["avatar_url"] is None
        assert not disk_path.exists()

    def test_remove_when_no_avatar_exists_is_graceful(self, user_a):
        response = client.delete("/api/v1/users/me/avatar", headers=user_a["headers"])

        assert response.status_code == 200
        assert response.json()["avatar_url"] is None


# ---------- avatar_url no longer editable via PATCH ----------

class TestAvatarUrlNotInProfilePatch:
    def test_patch_profile_cannot_set_arbitrary_avatar_url(self, user_a):
        response = client.patch(
            "/api/v1/users/me",
            headers=user_a["headers"],
            json={"fullname": "Ali Khan", "avatar_url": "https://evil.example.com/x.png"},
        )

        assert response.status_code == 200
        assert response.json()["avatar_url"] is None  # ignored, never set