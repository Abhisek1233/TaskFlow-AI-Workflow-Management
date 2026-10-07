from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, default="General", index=True)
    priority = Column(String(20), nullable=False, default="Medium", index=True)
    status = Column(String(20), nullable=False, default="Pending", index=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship to user
    owner = relationship("User", back_populates="tasks")

    def __repr__(self):
        return f"<Task id={self.id} title='{self.title}' status='{self.status}'>"
