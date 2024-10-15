import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models import ICal, ICalCreate, ICalPublic, ICalUpdate, Message

router = APIRouter()

@router.get("/me", response_model=ICalPublic)
def read_my_ical(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Retrieve the current user's iCal.
    """
    ical = session.exec(select(ICal).where(ICal.owner_id == current_user.id)).first()
    if not ical:
        raise HTTPException(status_code=404, detail="iCal not found")
    return ical

@router.post("/me", response_model=ICalPublic)
def create_my_ical(
    *, session: SessionDep, current_user: CurrentUser, ical_in: ICalCreate
) -> Any:
    """
    Create a new iCal for the current user.
    """
    # Check if the user already has an iCal
    existing_ical = session.exec(select(ICal).where(ICal.owner_id == current_user.id)).first()
    if existing_ical:
        raise HTTPException(status_code=400, detail="User already has an iCal")
    ical = ICal.model_validate(ical_in, update={"owner_id": current_user.id})
    session.add(ical)
    session.commit()
    session.refresh(ical)
    return ical

@router.patch("/me", response_model=ICalPublic)
def update_my_ical(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    ical_in: ICalUpdate,
) -> Any:
    """
    Update the current user's iCal.
    """
    ical = session.exec(select(ICal).where(ICal.owner_id == current_user.id)).first()
    if not ical:
        raise HTTPException(status_code=404, detail="iCal not found")
    update_dict = ical_in.model_dump(exclude_unset=True)
    ical.sqlmodel_update(update_dict)
    session.add(ical)
    session.commit()
    session.refresh(ical)
    return ical

@router.delete("/me")
def delete_my_ical(session: SessionDep, current_user: CurrentUser) -> Message:
    """
    Delete the current user's iCal.
    """
    ical = session.exec(select(ICal).where(ICal.owner_id == current_user.id)).first()
    if not ical:
        raise HTTPException(status_code=404, detail="iCal not found")
    session.delete(ical)
    session.commit()
    return Message(message="iCal deleted successfully")
