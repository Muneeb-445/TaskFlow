from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.routers import auth, users
from app.core.config import settings
from app.core.exceptions import ConflictError, ForbiddenError, InvalidCredentialsError, NotFoundError


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.project_name,
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
    )

    if settings.backend_cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.backend_cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.exception_handler(ConflictError)
    async def conflict_error_handler(request: Request, exc: ConflictError):
        return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"detail": str(exc)})

    @app.exception_handler(InvalidCredentialsError)
    async def invalid_credentials_handler(request: Request, exc: InvalidCredentialsError):
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"detail": str(exc)})

    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError):
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": str(exc)})

    @app.exception_handler(ForbiddenError)
    async def forbidden_handler(request: Request, exc: ForbiddenError):
        return JSONResponse(status_code=status.HTTP_403_FORBIDDEN, content={"detail": str(exc)})

    app.include_router(auth.router, prefix=settings.api_v1_prefix)
    app.include_router(users.router, prefix=settings.api_v1_prefix)

    @app.get("/health", tags=["health"])
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()