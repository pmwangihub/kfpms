from django.db import models
from django.contrib.auth.models import User
from typing import Optional
import json


class Beneficiary(models.Model):
    """
    Model to store information about beneficiaries of the feeding program.
    
    Attributes:
        name (str): Full name of the beneficiary.
        age (int): Age of the beneficiary.
        location (str): Geographic location of the beneficiary.
        created_at (datetime): Timestamp when the beneficiary was added.
        updated_at (datetime): Timestamp of the last update.
    """
    name = models.CharField(max_length=100)
    age= models.IntegerField()
    location = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        """String representation of the Beneficiary model."""
        return self.name

    class Meta:
        """Metadata for the Beneficiary model."""
        verbose_name: str = "Beneficiary"
        verbose_name_plural: str = "Beneficiaries"


class Fund(models.Model):
    """
    Model to store information about allocated funds.
    
    Attributes:
        amount (Decimal): Amount of the fund.
        source (str): Source of the fund (e.g., NGO, government).
        allocated_at (datetime): Timestamp when the fund was allocated.
        description (str): Additional details about the fund.
    """
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    source= models.CharField(max_length=100)
    allocated_at = models.DateTimeField(auto_now_add=True)
    description= models.TextField()

    def __str__(self) -> str:
        """String representation of the Fund model."""
        return f"{self.source} - {self.amount}"

    class Meta:
        """Metadata for the Fund model."""
        verbose_name: str = "Fund"
        verbose_name_plural: str = "Funds"


class Transaction(models.Model):
    """
    Model to store transactions related to fund disbursements.
    
    Attributes:
        fund (Fund): Foreign key to the associated Fund.
        amount (Decimal): Amount of the transaction.
        recipient (str): Name or ID of the recipient.
        date (datetime): Timestamp of the transaction.
        status (str): Status of the transaction (pending or completed).
    """
    STATUS_CHOICES: tuple = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
    )

    fund = models.ForeignKey(Fund, on_delete=models.CASCADE)
    amount= models.DecimalField(max_digits=10, decimal_places=2)
    recipient = models.CharField(max_length=100)
    date= models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self) -> str:
        """String representation of the Transaction model."""
        return f"{self.recipient} - {self.amount}"

    class Meta:
        """Metadata for the Transaction model."""
        verbose_name: str = "Transaction"
        verbose_name_plural: str = "Transactions"
        
        
class SyncQueue(models.Model):
    """
    Model to store pending operations for offline synchronization.
    
    Attributes:
        action (str): Type of operation (create, update, delete).
        model_name (str): Name of the model (e.g., Beneficiary, Fund, Transaction).
        data (JSON): JSON-serialized data for the operation.
        timestamp (datetime): When the operation was queued.
    """
    ACTION_CHOICES: tuple = (
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
    )

    action: models.CharField = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name: models.CharField = models.CharField(max_length=50)
    data: models.JSONField = models.JSONField()
    timestamp: models.DateTimeField = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        """String representation of the SyncQueue model."""
        return f"{self.action} - {self.model_name} - {self.timestamp}"

    class Meta:
        """Metadata for the SyncQueue model."""
        verbose_name: str = "Sync Queue"
        verbose_name_plural: str = "Sync Queues"
        
        
        