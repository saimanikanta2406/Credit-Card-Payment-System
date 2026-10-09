
from django.urls import path

from .views import (
    TransactionListView,
    TransactionExportCSVView,
    AdminDashboardView,
)

urlpatterns = [
    path(
        "dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard",
    ),
    path(
        "export/",
        TransactionExportCSVView.as_view(),
        name="transaction-export",
    ),
    path(
        "",
        TransactionListView.as_view(),
        name="transactions",
    ),
]
