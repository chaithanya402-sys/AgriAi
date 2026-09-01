from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.models.user import User
from app.models.farm import Farm, Field
from app.schemas.farm import FarmCreate, FarmUpdate, FarmResponse, FieldCreate, FieldResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/farms", tags=["farms"])


@router.get("", response_model=List[FarmResponse])
def list_farms(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Farm).filter(Farm.user_id == user.id).order_by(Farm.created_at).all()


@router.post("", response_model=FarmResponse, status_code=201)
def create_farm(data: FarmCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = Farm(user_id=user.id, **data.model_dump())
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm


@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(farm_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return farm


@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(farm_id: int, data: FarmUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(farm, key, value)
    db.commit()
    db.refresh(farm)
    return farm


@router.delete("/{farm_id}", status_code=204)
def delete_farm(farm_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    db.delete(farm)
    db.commit()
    return None


# Fields ---------------------------------------------------------
@router.post("/{farm_id}/fields", response_model=FieldResponse, status_code=201)
def create_field(farm_id: int, data: FieldCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    field = Field(farm_id=farm_id, **data.model_dump())
    db.add(field)
    db.commit()
    db.refresh(field)
    return field


@router.get("/{farm_id}/fields", response_model=List[FieldResponse])
def list_fields(farm_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return db.query(Field).filter(Field.farm_id == farm_id).all()


@router.delete("/fields/{field_id}", status_code=204)
def delete_field(field_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    # ensure ownership
    farm = db.query(Farm).filter(Farm.id == field.farm_id, Farm.user_id == user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Field not found")
    db.delete(field)
    db.commit()
    return None
