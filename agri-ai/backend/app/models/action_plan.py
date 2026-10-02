from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.database import Base


class ActionPlanStep(Base):
    __tablename__ = "action_plan_steps"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(100), index=True, nullable=False)
    step_number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    timeframe = Column(String(50), nullable=True)
    stage = Column(String(100), nullable=True)
    youtube_video_id = Column(String(50), nullable=False)
    youtube_title = Column(String(255), nullable=True)
    youtube_duration = Column(String(50), nullable=True)
    learn_points = Column(JSON, nullable=True)
    why_explanation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    checklists = relationship("ActionStepChecklist", back_populates="step", cascade="all, delete-orphan", order_by="ActionStepChecklist.sort_order")


class ActionStepChecklist(Base):
    __tablename__ = "action_step_checklists"

    id = Column(Integer, primary_key=True, index=True)
    step_id = Column(Integer, ForeignKey("action_plan_steps.id", ondelete="CASCADE"), nullable=False)
    item_key = Column(String(50), nullable=True)
    name = Column(String(255), nullable=False)
    spec = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)

    # Relationships
    step = relationship("ActionPlanStep", back_populates="checklists")


class UserActionProgress(Base):
    __tablename__ = "user_action_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False, index=True)
    crop_name = Column(String(100), nullable=False, index=True)
    step_number = Column(Integer, nullable=False)
    tutorial_watched = Column(Integer, default=0)
    tutorial_watched_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="pending")  # pending, in_progress, completed
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    checklist_progresses = relationship("UserChecklistProgress", back_populates="action_progress", cascade="all, delete-orphan")


class UserChecklistProgress(Base):
    __tablename__ = "user_checklist_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_action_progress_id = Column(Integer, ForeignKey("user_action_progress.id", ondelete="CASCADE"), nullable=False, index=True)
    checklist_item_id = Column(Integer, ForeignKey("action_step_checklists.id", ondelete="CASCADE"), nullable=False)
    completed = Column(Integer, default=0)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    action_progress = relationship("UserActionProgress", back_populates="checklist_progresses")
