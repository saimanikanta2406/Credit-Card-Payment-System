
from datetime import datetime
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import Base, get_db
from auth import get_current_user
from models import Card, Transaction


# Separate temporary database for tests.
TEST_DATABASE_URL = "sqlite://"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


@pytest.fixture
def test_setup():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()

    # Simulate a logged-in user with ID 1.
    app.dependency_overrides[get_current_user] = lambda: 1

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    # Card owned by the logged-in user.
    own_card = Card(
        user_id=1,
        cardholder_name="Test User",
        card_type="CREDIT",
        masked_card_number="************1111",
        last4="1111",
        expiry_month=12,
        expiry_year=2030,
        created_at=datetime(2026, 1, 1),
    )

    # Card owned by another user.
    other_card = Card(
        user_id=2,
        cardholder_name="Other User",
        card_type="DEBIT",
        masked_card_number="************2222",
        last4="2222",
        expiry_month=10,
        expiry_year=2031,
        created_at=datetime(2026, 1, 1),
    )

    db.add_all([own_card, other_card])
    db.commit()
    db.refresh(own_card)
    db.refresh(other_card)

    client = TestClient(app)

    yield client, db, own_card, other_card

    app.dependency_overrides.clear()
    db.close()
    Base.metadata.drop_all(bind=test_engine)


def test_successful_payment(test_setup):
    client, db, card, _ = test_setup

    response = client.post(
        "/payments/",
        json={
            "card_id": card.id,
            "amount": "500.00",
            "simulate_success": True,
        },
    )

    assert response.status_code == 201

    data = response.json()
    assert data["status"] == "SUCCESS"
    assert Decimal(str(data["amount"])) == Decimal("500.00")
    assert data["user_id"] == 1
    assert data["card_id"] == card.id
    assert data["message"] == "Payment successful"
    assert data["transaction_reference"].startswith("TXN-")

    transaction = db.query(Transaction).filter_by(
        id=data["transaction_id"]
    ).first()

    assert transaction is not None
    assert transaction.status == "SUCCESS"


def test_failed_payment(test_setup):
    client, db, card, _ = test_setup

    response = client.post(
        "/payments/",
        json={
            "card_id": card.id,
            "amount": "250.00",
            "simulate_success": False,
        },
    )

    assert response.status_code == 201

    data = response.json()
    assert data["status"] == "FAILED"
    assert data["message"] == "Payment failed"

    transaction = db.query(Transaction).filter_by(
        id=data["transaction_id"]
    ).first()

    assert transaction is not None
    assert transaction.status == "FAILED"


def test_user_cannot_pay_with_another_users_card(test_setup):
    client, db, _, other_card = test_setup

    response = client.post(
        "/payments/",
        json={
            "card_id": other_card.id,
            "amount": "100.00",
            "simulate_success": True,
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == (
        "Card not found or does not belong to the user"
    )
    assert db.query(Transaction).count() == 0


def test_payment_with_nonexistent_card(test_setup):
    client, db, _, _ = test_setup

    response = client.post(
        "/payments/",
        json={
            "card_id": 999999,
            "amount": "100.00",
            "simulate_success": True,
        },
    )

    assert response.status_code == 404
    assert db.query(Transaction).count() == 0


def test_payment_rejects_missing_required_fields(test_setup):
    client, _, _, _ = test_setup

    response = client.post(
        "/payments/",
        json={"card_id": 1},
    )

    assert response.status_code == 422


@pytest.mark.parametrize(
    "payload",
    [
        {
            "card_id": 1,
            "amount": "0",
            "simulate_success": True,
        },
        {
            "card_id": 1,
            "amount": "-10.00",
            "simulate_success": True,
        },
        {
            "card_id": 1,
            "amount": "10.999",
            "simulate_success": True,
        },
        {
            "card_id": 0,
            "amount": "10.00",
            "simulate_success": True,
        },
    ],
)
def test_invalid_payment_data_is_rejected(test_setup, payload):
    client, db, _, _ = test_setup

    response = client.post("/payments/", json=payload)

    assert response.status_code == 422
    assert db.query(Transaction).count() == 0


def test_payment_references_are_unique(test_setup):
    client, _, card, _ = test_setup

    payload = {
        "card_id": card.id,
        "amount": "100.00",
        "simulate_success": True,
    }

    response1 = client.post("/payments/", json=payload)
    response2 = client.post("/payments/", json=payload)

    assert response1.status_code == 201
    assert response2.status_code == 201

    reference1 = response1.json()["transaction_reference"]
    reference2 = response2.json()["transaction_reference"]

    assert reference1 != reference2


def test_payment_requires_authentication():
    # Remove the authentication override for this request.
    app.dependency_overrides.pop(get_current_user, None)

    try:
        client = TestClient(app)
        response = client.post(
            "/payments/",
            json={
                "card_id": 1,
                "amount": "100.00",
                "simulate_success": True,
            },
        )

        assert response.status_code == 401
    finally:
        app.dependency_overrides.clear()
