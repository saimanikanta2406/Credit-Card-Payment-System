
import csv
from django.db.models import Count, Sum, Q
from django.utils import timezone
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView

from .models import Transaction
from .serializers import TransactionSerializer


class TransactionListView(generics.ListAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.filter(
            user_id=self.request.user.id
        ).order_by("-created_at")

        status_value = self.request.query_params.get("status")
        amount = self.request.query_params.get("amount")
        date = self.request.query_params.get("date")

        if status_value:
            queryset = queryset.filter(
                status=status_value.upper()
            )

        if amount:
            queryset = queryset.filter(amount=amount)

        if date:
            queryset = queryset.filter(created_at__date=date)

        return queryset


class TransactionExportCSVView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        response = HttpResponse(
            content_type="text/csv; charset=utf-8"
        )

        response["Content-Disposition"] = (
            'attachment; filename="transactions.csv"'
        )

        writer = csv.writer(response)

        writer.writerow([
            "Transaction ID",
            "User ID",
            "Card ID",
            "Amount",
            "Status",
            "Transaction Reference",
            "Created At",
            "Updated At",
        ])

        transactions = Transaction.objects.all().order_by("-created_at")

        for transaction in transactions:
            writer.writerow([
                transaction.id,
                transaction.user_id,
                transaction.card_id,
                transaction.amount,
                transaction.status,
                transaction.transaction_reference,
                transaction.created_at,
                transaction.updated_at,
            ])

        return response
    
    
class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        today = timezone.localdate()

        today_transactions = Transaction.objects.filter(
            created_at__date=today
        )

        summary = today_transactions.aggregate(
            total_transactions=Count("id"),
            successful_transactions=Count(
                "id",
                filter=Q(status="SUCCESS"),
            ),
            failed_transactions=Count(
                "id",
                filter=Q(status="FAILED"),
            ),
            successful_amount=Sum(
                "amount",
                filter=Q(status="SUCCESS"),
            ),
        )

        return Response({
            "date": str(today),
            "total_transactions": summary["total_transactions"],
            "successful_transactions": summary["successful_transactions"],
            "failed_transactions": summary["failed_transactions"],
            "successful_amount": str(
                summary["successful_amount"] or 0
            ),
        })

