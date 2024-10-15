import uuid
from typing import Any
import httpx

from fastapi import APIRouter, HTTPException
from sqlmodel import select
from app.core.ics_cleaner import modify_ics

from app.api.deps import SessionDep
from app.models import ICal

router = APIRouter()

@router.get("/{user_id}", response_model=Any)
def get_ics_file(session: SessionDep, user_id: str) -> Any:
    """
    Retrieve the fixed up .ics file from the user.
    """
    # convert the user_id to a UUID
    try:
        user_id = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # Get the user's iCal
    ical = session.exec(select(ICal).where(ICal.owner_id == user_id)).first()
    if not ical:
        raise HTTPException(status_code=404, detail="iCal not found")

    # request the iCal content from the ical.ical_url
    response = httpx.get(ical.ical_url)
    response.raise_for_status()
    
    # modify the iCal content
    modified_ics = modify_ics(response.text)

    return modified_ics
