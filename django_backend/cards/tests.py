
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Card


class CardManagementTests(APITestCase):
    def setUp(self):
        self.cards_url = "/api/cards/"

        self.user1 = User.objects.create_user(
            username="carduser1",
            email="carduser1@example.com",
            password="TestPass@123",
        )

        self.user2 = User.objects.create_user(
            username="carduser2",
            email="carduser2@example.com",
            password="TestPass@123",
        )

        self.card_data = {
            "cardholder_name": "Test User",
            "card_type": "CREDIT",
            "card_number": "4111111111111111",
            "expiry_month": 12,
            "expiry_year": 2030,
        }

    def test_unauthenticated_user_cannot_view_cards(self):
        response = self.client.get(self.cards_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_user_can_add_card(self):
        self.client.force_authenticate(user=self.user1)

        response = self.client.post(
            self.cards_url,
            self.card_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertTrue(
            Card.objects.filter(user=self.user1).exists()
        )

        card = Card.objects.get(user=self.user1)

        self.assertEqual(card.last4, "1111")
        self.assertNotEqual(
            card.masked_card_number,
            self.card_data["card_number"],
        )

        self.assertNotIn("card_number", response.data)
        self.assertNotIn("cvv", response.data)

    def test_user_can_only_view_own_cards(self):
        Card.objects.create(
            user=self.user1,
            cardholder_name="User One",
            card_type="CREDIT",
            masked_card_number="************1111",
            last4="1111",
            expiry_month=12,
            expiry_year=2030,
        )

        Card.objects.create(
            user=self.user2,
            cardholder_name="User Two",
            card_type="DEBIT",
            masked_card_number="************2222",
            last4="2222",
            expiry_month=10,
            expiry_year=2031,
        )

        self.client.force_authenticate(user=self.user1)

        response = self.client.get(self.cards_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["last4"],
            "1111",
        )

    def test_user_cannot_delete_another_users_card(self):
        other_card = Card.objects.create(
            user=self.user2,
            cardholder_name="User Two",
            card_type="DEBIT",
            masked_card_number="************2222",
            last4="2222",
            expiry_month=10,
            expiry_year=2031,
        )

        self.client.force_authenticate(user=self.user1)

        response = self.client.delete(
            f"{self.cards_url}{other_card.id}/"
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_403_FORBIDDEN,
                status.HTTP_404_NOT_FOUND,
            ],
        )

        self.assertTrue(
            Card.objects.filter(id=other_card.id).exists()
        )

    def test_user_can_delete_own_card(self):
        card = Card.objects.create(
            user=self.user1,
            cardholder_name="Test User",
            card_type="CREDIT",
            masked_card_number="************1111",
            last4="1111",
            expiry_month=12,
            expiry_year=2030,
        )

        self.client.force_authenticate(user=self.user1)

        response = self.client.delete(
            f"{self.cards_url}{card.id}/"
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_204_NO_CONTENT,
            ],
        )

        self.assertFalse(
            Card.objects.filter(id=card.id).exists()
        )
