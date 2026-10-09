from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, Numeric, String

from database import Base


class Card(Base):
    __tablename__ = "cards_card"

    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    cardholder_name = Column(
        String(100),
        nullable=False
    )

    card_type = Column(
        String(10),
        nullable=False
    )

    masked_card_number = Column(
        String(19),
        nullable=False
    )

    last4 = Column(
        String(4),
        nullable=False
    )

    expiry_month = Column(
        Integer,
        nullable=False
    )

    expiry_year = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        nullable=False
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    card_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    amount = Column(
        Numeric(10, 2),
        nullable=False
    )

    status = Column(
        String(20),
        nullable=False,
        default="PENDING"
    )

    transaction_reference = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )