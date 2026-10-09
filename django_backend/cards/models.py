from django.db import models
from django.contrib.auth.models import User


class Card(models.Model):

    CARD_TYPE_CHOICES = [
        ("CREDIT", "Credit Card"),
        ("DEBIT", "Debit Card"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="cards"
    )

    cardholder_name = models.CharField(max_length=100)

    card_type = models.CharField(
        max_length=10,
        choices=CARD_TYPE_CHOICES
    )

    masked_card_number = models.CharField(max_length=19)

    last4 = models.CharField(max_length=4)

    expiry_month = models.PositiveSmallIntegerField()

    expiry_year = models.PositiveSmallIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.card_type} ****{self.last4}"