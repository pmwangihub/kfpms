from django.contrib import admin
from .models import Beneficiary, Fund, Transaction, SyncQueue
from typing import Type, Any, Optional, Sequence


@admin.register(Beneficiary)
class BeneficiaryAdmin(admin.ModelAdmin):
    """
    Admin interface for managing Beneficiary model.

    Attributes:
        list_display (tuple): Fields to display in the admin list view.
        list_filter (tuple): Fields to filter by in the admin interface.
        search_fields (tuple): Fields to search by in the admin interface.
    """

    list_display = (
        "name",
        "age",
        "location",
        "created_at",
        "updated_at",
    )
    list_filter = (
        "location",
        "created_at",
    )
    search_fields = ("name", "location")

    def get_queryset(self, request: Any) -> Any:
        """
        Return the queryset for the Beneficiary model.

        Args:
            request: The HTTP request object.

        Returns:
            QuerySet: Queryset of Beneficiary objects.
        """
        return super().get_queryset(request)


@admin.register(Fund)
class FundAdmin(admin.ModelAdmin):
    """
    Admin interface for managing Fund model.

    Attributes:
        list_display (tuple): Fields to display in the admin list view.
        list_filter (tuple): Fields to filter by in the admin interface.
        search_fields (tuple): Fields to search by in the admin interface.
    """

    list_display: tuple[str, ...] = (
        "id",
        "source",
        "amount",
        "allocated_at",
        "description",
    )
    list_filter: tuple[str, ...] = ("source", "allocated_at")
    search_fields: tuple[str, ...] = ("source", "description")

    def get_queryset(self, request: Any) -> Any:
        """
        Return the queryset for the Fund model.

        Args:
            request: The HTTP request object.

        Returns:
            QuerySet: Queryset of Fund objects.
        """
        return super().get_queryset(request)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """
    Admin interface for managing Transaction model.

    Attributes:
        list_display (tuple): Fields to display in the admin list view.
        list_filter (tuple): Fields to filter by in the admin interface.
        search_fields (tuple): Fields to search by in the admin interface.
    """

    list_display: tuple[str, ...] = ("fund", "amount", "recipient", "status", "date")
    list_filter: tuple[str, ...] = ("status", "date", "fund")
    search_fields: tuple[str, ...] = ("recipient",)

    def get_queryset(self, request: Any) -> Any:
        """
        Return the queryset for the Transaction model.

        Args:
            request: The HTTP request object.

        Returns:
            QuerySet: Queryset of Transaction objects.
        """
        return super().get_queryset(request)


@admin.register(SyncQueue)
class SyncQueueAdmin(admin.ModelAdmin):
    """
    Admin interface for managing SyncQueue model.

    Attributes:
        list_display (tuple): Fields to display in the admin list view.
        list_filter (tuple): Fields to filter by in the admin interface.
        search_fields (tuple): Fields to search by in the admin interface.
    """

    list_display: tuple[str, ...] = ("action", "model_name", "timestamp")
    list_filter: tuple[str, ...] = ("action", "model_name", "timestamp")
    search_fields: tuple[str, ...] = ("model_name",)

    def get_queryset(self, request: Any) -> Any:
        """
        Return the queryset for the SyncQueue model.

        Args:
            request: The HTTP request object.

        Returns:
            QuerySet: Queryset of SyncQueue objects.
        """
        return super().get_queryset(request)
