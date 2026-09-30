import uuid
from io import BytesIO
from pathlib import Path

from PIL import Image, UnidentifiedImageError

from app.core.config import settings
from app.core.exceptions import ValidationError

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_DIMENSION = 512


class AvatarStorage:
    """Handles validating, processing, saving, and deleting avatar files
    on local disk. Pure file/image mechanics — no database, no business
    rules about ownership (that's UserService's job)."""

    def __init__(self) -> None:
        self._upload_dir = Path(settings.UPLOAD_DIR)
        self._upload_dir.mkdir(parents=True, exist_ok=True)

    def validate_and_process(self, raw_bytes: bytes, content_type: str) -> bytes:
        if content_type not in ALLOWED_CONTENT_TYPES:
            raise ValidationError(
                f"Unsupported file type '{content_type}'. Allowed: JPEG, PNG, WEBP."
            )

        if len(raw_bytes) > settings.MAX_AVATAR_SIZE_BYTES:
            max_mb = settings.MAX_AVATAR_SIZE_BYTES / (1024 * 1024)
            raise ValidationError(f"File too large. Maximum size is {max_mb:.0f} MB.")

        try:
            image = Image.open(BytesIO(raw_bytes))
            image.verify()
            image = Image.open(BytesIO(raw_bytes))  # re-open: verify() exhausts the file
        except UnidentifiedImageError:
            raise ValidationError("File is not a valid image.")

        image = image.convert("RGB")
        image.thumbnail((MAX_DIMENSION, MAX_DIMENSION))

        buffer = BytesIO()
        image.save(buffer, format="WEBP", quality=80)
        return buffer.getvalue()

    def save(self, processed_bytes: bytes) -> str:
        filename = f"{uuid.uuid4().hex}.webp"
        file_path = self._upload_dir / filename
        file_path.write_bytes(processed_bytes)
        return f"{settings.AVATAR_URL_PREFIX}/{filename}"

    def delete_by_url(self, avatar_url: str | None) -> None:
        if not avatar_url or not avatar_url.startswith(settings.AVATAR_URL_PREFIX):
            return
        filename = avatar_url.rsplit("/", 1)[-1]
        file_path = self._upload_dir / filename
        file_path.unlink(missing_ok=True)


avatar_storage = AvatarStorage()