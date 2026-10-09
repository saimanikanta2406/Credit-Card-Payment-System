from rest_framework import serializers
from .models import Card


class CardSerializer(serializers.ModelSerializer):

    card_number = serializers.CharField(
        write_only=True,
        min_length=13,
        max_length=19
    )

    class Meta:
        model = Card
        fields = [
            "id",
            "cardholder_name",
            "card_type",
            "card_number",
            "masked_card_number",
            "last4",
            "expiry_month",
            "expiry_year",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "masked_card_number",
            "last4",
            "created_at",
        ]

    def validate_card_number(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(
                "Card number must contain only digits."
            )

        if not 13 <= len(value) <= 19:
            raise serializers.ValidationError(
                "Card number must be between 13 and 19 digits."
            )

        return value

    def validate_expiry_month(self, value):
        if value < 1 or value > 12:
            raise serializers.ValidationError(
                "Expiry month must be between 1 and 12."
            )

        return value

    def create(self, validated_data):
        card_number = validated_data.pop("card_number")

        last4 = card_number[-4:]

        masked_card_number = "**** **** **** " + last4

        user = self.context["request"].user

        card = Card.objects.create(
            user=user,
            masked_card_number=masked_card_number,
            last4=last4,
            **validated_data
        )

        return card