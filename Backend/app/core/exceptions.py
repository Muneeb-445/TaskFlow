class AppError(Exception):
    """Base class for all application-specific errors.
    Services raise these; routers translate them into HTTP responses."""


class NotFoundError(AppError):
    """Raised when a requested resource does not exist (or isn't visible to the caller)."""


class ConflictError(AppError):
    """Raised on uniqueness violations, e.g. duplicate email or duplicate category name."""


class ForbiddenError(AppError):
    """Raised when an authenticated user attempts to act on a resource they don't own."""


class InvalidCredentialsError(AppError):
    """Raised on failed login (wrong email/password, or inactive account)."""