from fastapi import APIRouter

from app.api.routes import icals, login, users, proxy

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(icals.router, prefix="/ical", tags=["ical"])
api_router.include_router(proxy.router, prefix="/proxy", tags=["proxy"])

