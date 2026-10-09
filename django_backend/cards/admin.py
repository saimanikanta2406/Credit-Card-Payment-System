
from django.contrib import admin

from .models import Card


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "cardholder_name",
        "card_type",
        "masked_card_number",
        "last4",
        "user",
        "created_at",
    )

    list_filter = ("card_type", "created_at")

    search_fields = (
        "cardholder_name",
        "masked_card_number",
        "user__username",
    )

    readonly_fields = (
        "user",
        "cardholder_name",
        "card_type",
        "masked_card_number",
        "last4",
        "expiry_month",
        "expiry_year",
        "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
