from rest_framework import serializers
from .models import Beneficiary, Fund, Transaction, SyncQueue
from typing import Dict, Any
from django.contrib.auth.models import User


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.

    Attributes:
        model (User): The model to serialize.
        fields (list): Fields to include (username, email).
    """

    class Meta:
        model = User
        fields = "__all__"


class BeneficiarySerializer(serializers.ModelSerializer):
    """
    Serializer for the Beneficiary model to handle JSON serialization/deserialization.

    Attributes:
        model (Beneficiary): The model to serialize.
        fields (str): All fields to include in the serialized output.
    """

    class Meta:
        model = Beneficiary
        fields: str = "__all__"

    def validate_age(self, value: int) -> int:
        """Validate that the beneficiary's age is positive."""
        if value < 0:
            raise serializers.ValidationError("Age must be a positive integer.")
        return value


class FundSerializer(serializers.ModelSerializer):
    """
    Serializer for the Fund model to handle JSON serialization/deserialization.

    Attributes:
        model (Fund): The model to serialize.
        fields (str): All fields to include in the serialized output.
    """

    class Meta:
        model = Fund
        fields: str = "__all__"

    def validate_amount(self, value: float) -> float:
        """Validate that the fund amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Transaction model to handle JSON serialization/deserialization.

    Attributes:
        model (Transaction): The model to serialize.
        fields (str): All fields to include in the serialized output.
    """

    class Meta:
        model = Transaction
        fields: str = "__all__"

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate that the transaction amount does not exceed the fund's available amount."""
        fund = data.get("fund")
        amount = data.get("amount")
        if fund and amount > fund.amount:
            raise serializers.ValidationError(
                "Transaction amount exceeds available fund."
            )
        return data


class ReportSerializer(serializers.Serializer):
    """
    Serializer for generating program reports.

    Attributes:
        total_funds (float): Total amount of allocated funds.
        total_transactions (int): Total number of transactions.
        total_beneficiaries (int): Total number of beneficiaries.
    """

    total_funds = serializers.FloatField()
    total_transactions = serializers.IntegerField()
    total_beneficiaries = serializers.IntegerField()


class SyncQueueSerializer(serializers.ModelSerializer):
    """
    Serializer for the SyncQueue model to handle synchronization requests.

    Attributes:
        model (SyncQueue): The model to serialize.
        fields (str): All fields to include in the serialized output.
    """

    class Meta:
        model = SyncQueue
        fields: str = "__all__"

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate the sync queue data.

        Args:
            data (Dict[str, Any]): The incoming data to validate.

        Returns:
            Dict[str, Any]: Validated data.

        Raises:
            serializers.ValidationError: If action or model_name is invalid.
        """
        valid_actions = [choice[0] for choice in SyncQueue.ACTION_CHOICES]
        valid_models = ["Beneficiary", "Fund", "Transaction"]

        if data["action"] not in valid_actions:
            raise serializers.ValidationError(f"Invalid action: {data['action']}")
        if data["model_name"] not in valid_models:
            raise serializers.ValidationError(
                f"Invalid model_name: {data['model_name']}"
            )

        return data
