from typing import Any, Dict, List, Type
from django.db import transaction as db_transaction
from django.db.models import Sum
from rest_framework import status, viewsets
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

# from rest_framework.status import

from .models import Beneficiary, Fund, Transaction
from .permissions import IsAdmin, IsAuthenticatedAndRole, IsDonor, IsFieldOfficer
from .serializers import (
    BeneficiarySerializer,
    FundSerializer,
    ReportSerializer,
    TransactionSerializer,
    SyncQueueSerializer,
    ProfileSerializer,
)


class ProfileView(APIView):
    """
    API view to view and update user profile.

    Attributes:
        permission_classes (list): Requires authentication.

    Methods:
        get: Retrieve user details.
        put: Update user details.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve the authenticated user's profile.

        Args:
            request: HTTP request object.

        Returns:
            Response: JSON with user details (username, email).
        """
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        """
        Update the authenticated user's profile.

        Args:
            request: HTTP request object with user data.

        Returns:
            Response: Success or error message.
        """
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Profile updated successfully"})
        return Response(serializer.errors, status=400)


class VerifyTokenView(APIView):
    """
    API view to verify JWT token validity.

    Attributes:
        permission_classes (list): Requires authentication.

    Methods:
        get: Verifies the token and returns success response.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Verify the user's JWT token.

        Args:
            request: HTTP request object.

        Returns:
            Response: Success message if token is valid.
        """
        return Response({"detail": "Token is valid"})


class StatsView(APIView):
    """
    API view to retrieve summary statistics for the dashboard.

    Attributes:
        permission_classes (list): Requires authentication for access.

    Methods:
        get: Returns counts of beneficiaries, funds, and transactions.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve counts of beneficiaries, funds, and transactions.

        Args:
            request: HTTP request object.

        Returns:
            Response: JSON with counts {'beneficiaries': int, 'funds': int, 'transactions': int}.
        """
        stats = {
            "beneficiaries": Beneficiary.objects.count(),
            "funds": Fund.objects.count(),
            "transactions": Transaction.objects.count(),
        }
        return Response(stats)


class BeneficiaryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Beneficiary objects via REST API.

    Attributes:
        queryset: All Beneficiary objects.
        serializer_class: Serializer for Beneficiary model.
        permission_classes: Requires authentication for all actions.

    Permissions:
        - Admin: Full access (CRUD).
        - FieldOfficer: Create and read.
        - Donor: Read-only.
    """

    queryset = Beneficiary.objects.all()
    serializer_class: Type[BeneficiarySerializer] = BeneficiarySerializer
    # Define allowed roles here
    allowed_roles = None

    def get_permissions(self) -> List[BasePermission]:
        """
        Assign permissions based on action.

        Returns:
            List[BasePermission]: List of permission classes.
        """
        if self.action in ["list", "retrieve"]:
            # Allow Admin, FieldOfficer, Donor for read actions
            permission = IsAuthenticatedAndRole()
            permission.allowed_roles = ["Admin", "FieldOfficer", "Donor"]
            self.allowed_roles = ["Admin", "FieldOfficer", "Donor"]
            return [permission]
        # Allow Admin, FieldOfficer for create/update/delete
        permission = IsAuthenticatedAndRole()
        permission.allowed_roles = ["Admin", "FieldOfficer"]
        self.allowed_roles = ["Admin", "FieldOfficer"]
        return [permission]


class FundViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Fund objects via REST API.

    Attributes:
        queryset: All Fund objects.
        serializer_class: Serializer for Fund model.
        permission_classes: Requires authentication for all actions.
    """

    queryset = Fund.objects.all()
    serializer_class: Type[FundSerializer] = FundSerializer

    def get_permissions(self) -> List[BasePermission]:
        """
        Assign permissions based on action.

        Returns:
            List[BasePermission]: List of permission classes.
        """
        if self.action in ["list", "retrieve"]:
            # Allow Admin, FieldOfficer, Donor for read actions
            permission = IsAuthenticatedAndRole()
            permission.allowed_roles = ["Admin", "FieldOfficer", "Donor"]
            self.allowed_roles = ["Admin", "FieldOfficer", "Donor"]
            return [permission]
        # Allow Admin, FieldOfficer for create/update/delete
        permission = IsAuthenticatedAndRole()
        permission.allowed_roles = ["Admin", "FieldOfficer"]
        self.allowed_roles = ["Admin", "FieldOfficer"]
        return [permission]


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Transaction objects via REST API.

    Attributes:
        queryset: All Transaction objects.
        serializer_class: Serializer for Transaction model.
        permission_classes: Requires authentication for all actions.
    """

    queryset = Transaction.objects.all()
    serializer_class: Type[TransactionSerializer] = TransactionSerializer

    def get_permissions(self) -> List[BasePermission]:
        """
        Assign permissions based on action.

        Returns:
            List[BasePermission]: List of permission classes.
        """
        if self.action in ["list", "retrieve"]:
            # Allow Admin, FieldOfficer, Donor for read actions
            permission = IsAuthenticatedAndRole()
            permission.allowed_roles = ["Admin", "FieldOfficer", "Donor"]
            self.allowed_roles = ["Admin", "FieldOfficer", "Donor"]
            return [permission]
        # Allow Admin, FieldOfficer for create/update/delete
        permission = IsAuthenticatedAndRole()
        permission.allowed_roles = ["Admin", "FieldOfficer"]
        self.allowed_roles = ["Admin", "FieldOfficer"]
        return [permission]


class ReportView(APIView):
    """
    API view to generate real-time program reports.

    Permissions:
        - Admin, FieldOfficer, Donor: Read-only access.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request: Any, *args: Any, **kwargs: Any) -> Response:
        """
        Generate a report with total funds, transactions, and beneficiaries.

        Args:
            request: The HTTP request object.

        Returns:
            Response: JSON response with report data.
        """
        try:
            total_funds: float = (
                Fund.objects.aggregate(total=Sum("amount"))["total"] or 0.0
            )
            total_transactions: int = Transaction.objects.count()
            total_beneficiaries: int = Beneficiary.objects.count()

            data: Dict[str, Any] = {
                "total_funds": total_funds,
                "total_transactions": total_transactions,
                "total_beneficiaries": total_beneficiaries,
            }

            serializer = ReportSerializer(data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SyncView(APIView):
    """
    API view to process sync queue entries from offline clients.

    Permissions:
        - Admin, FieldOfficer: Can process sync operations for create/update/delete.
    """

    permission_classes = [IsAuthenticatedAndRole]
    # Define allowed roles here
    allowed_roles = ["Admin", "FieldOfficer"]

    def post(self, request: Any, *args: Any, **kwargs: Any) -> Response:
        """
        Process sync queue entries sent from the frontend.

        Args:
            request: The HTTP request containing a list of sync queue entries.

        Returns:
            Response: JSON response with success/failure details.
        """
        try:
            # Expect a list of sync entries
            sync_entries = (
                request.data if isinstance(request.data, list) else [request.data]
            )
            results = []

            with db_transaction.atomic():
                for entry in sync_entries:
                    serializer = SyncQueueSerializer(data=entry)
                    if not serializer.is_valid():
                        results.append(
                            {
                                "entry": entry,
                                "status": "error",
                                "error": serializer.errors,
                            }
                        )
                        continue

                    action = serializer.validated_data["action"]
                    model_name = serializer.validated_data["model_name"]
                    data = serializer.validated_data["data"]

                    try:
                        if model_name == "Beneficiary":
                            self._process_beneficiary(action, data)
                        elif model_name == "Fund":
                            self._process_fund(action, data)
                        elif model_name == "Transaction":
                            self._process_transaction(action, data)
                        results.append({"entry": entry, "status": "success"})
                    except Exception as e:
                        results.append(
                            {"entry": entry, "status": "error", "error": str(e)}
                        )

            return Response({"results": results}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _process_beneficiary(self, action: str, data: Dict[str, Any]) -> None:
        """
        Process a sync operation for the Beneficiary model.

        Args:
            action (str): The action to perform (create, update, delete).
            data (Dict[str, Any]): The data for the operation.

        Raises:
            ValueError: If the action is invalid or data is missing required fields.
        """
        if action == "create":
            serializer = BeneficiarySerializer(data=data)
            if serializer.is_valid():
                serializer.save()
            else:
                raise ValueError(serializer.errors)
        elif action == "update":
            instance = Beneficiary.objects.get(id=data.get("id"))
            serializer = BeneficiarySerializer(instance, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
            else:
                raise ValueError(serializer.errors)
        elif action == "delete":
            Beneficiary.objects.get(id=data.get("id")).delete()

    def _process_fund(self, action: str, data: Dict[str, Any]) -> None:
        """
        Process a sync operation for the Fund model.

        Args:
            action (str): The action to perform (create, update, delete).
            data (Dict[str, Any]): The data for the operation.

        Raises:
            ValueError: If the action is invalid or data is missing required fields.
        """
        if action == "create":
            serializer = FundSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
            else:
                raise ValueError(serializer.errors)
        elif action == "update":
            instance = Fund.objects.get(id=data.get("id"))
            serializer = FundSerializer(instance, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
            else:
                raise ValueError(serializer.errors)
        elif action == "delete":
            Fund.objects.get(id=data.get("id")).delete()

    def _process_transaction(self, action: str, data: Dict[str, Any]) -> None:
        """
        Process a sync operation for the Transaction model.

        Args:
            action (str): The action to perform (create, update, delete).
            data (Dict[str, Any]): The data for the operation.

        Raises:
            ValueError: If the action is invalid or data is missing required fields.
        """
        if action == "create":
            serializer = TransactionSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
            else:
                raise ValueError(serializer.errors)
        elif action == "update":
            instance = Transaction.objects.get(id=data.get("id"))
            serializer = TransactionSerializer(instance, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
            else:
                raise ValueError(serializer.errors)
        elif action == "delete":
            Transaction.objects.get(id=data.get("id")).delete()
