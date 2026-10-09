import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Card, Transaction
from schemas import PaymentRequest, PaymentResponse


router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post(
    "/",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED
)
def make_payment(
    payment: PaymentRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check whether the card exists
    # AND belongs to the logged-in user.
    card = (
        db.query(Card)
        .filter(
            Card.id == payment.card_id,
            Card.user_id == user_id
        )
        .first()
    )

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found or does not belong to the user"
        )

    # Generate unique transaction reference.
    transaction_reference = (
        f"TXN-{uuid.uuid4().hex[:12].upper()}"
    )

    # Step 1: Create PENDING transaction.
    transaction = Transaction(
        user_id=user_id,
        card_id=payment.card_id,
        amount=payment.amount,
        status="PENDING",
        transaction_reference=transaction_reference
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # Step 2: Simulate payment result.
    if payment.simulate_success:
        transaction.status = "SUCCESS"
        message = "Payment successful"
    else:
        transaction.status = "FAILED"
        message = "Payment failed"

    db.commit()
    db.refresh(transaction)

    return PaymentResponse(
        transaction_id=transaction.id,
        transaction_reference=transaction.transaction_reference,
        user_id=transaction.user_id,
        card_id=transaction.card_id,
        amount=transaction.amount,
        status=transaction.status,
        message=message
    )