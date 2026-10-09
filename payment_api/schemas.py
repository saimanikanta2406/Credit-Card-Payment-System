from decimal import Decimal

from pydantic import BaseModel, Field


class PaymentRequest(BaseModel):
    card_id: int = Field(gt=0)

    amount: Decimal = Field(
        gt=0,
        max_digits=10,
        decimal_places=2
    )

    simulate_success: bool = True


class PaymentResponse(BaseModel):
    transaction_id: int
    transaction_reference: str
    user_id: int
    card_id: int
    amount: Decimal
    status: str
    message: str