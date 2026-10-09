from django.db import models


class Transaction(models.Model):
    id = models.AutoField(primary_key=True)

    user_id = models.IntegerField()

    card_id = models.IntegerField()

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20
    )

    transaction_reference = models.CharField(
        max_length=100,
        unique=True
    )

    created_at = models.DateTimeField()

    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "transactions"

    def __str__(self):
        return self.transaction_reference