
from django.contrib import admin

from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "transaction_reference",
        "user_id",
        "card_id",
        "amount",
        "status",
        "created_at",
    )

    list_filter = ("status", "created_at")

    search_fields = (
        "transaction_reference",
        "user_id",
        "card_id",
    )

    readonly_fields = (
        "id",
        "user_id",
        "card_id",
        "amount",
        "status",
        "transaction_reference",
        "created_at",
        "updated_at",
    )

    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
