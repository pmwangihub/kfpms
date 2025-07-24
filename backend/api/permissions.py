from rest_framework.permissions import BasePermission, IsAuthenticated
from django.contrib.auth.models import User
from typing import Any


class IsAuthenticatedAndRole(BasePermission):
    """
    Permission to ensure the user is authenticated and belongs to a specific role.

    Attributes:
        message (str): Error message for permission denial.
    """

    message = "User is not authenticated or lacks required role."

    def has_permission(self, request: Any, view: Any) -> bool:
        """
        Check if the user is authenticated and has one of the allowed roles.

        Args:
            request: The HTTP request object.
            view: The view being accessed.

        Returns:
            bool: True if user is authenticated and has an allowed role, False otherwise.
        """
        # Check authentication
        if not IsAuthenticated().has_permission(request, view):
            print("\npermissions.py: NOT AUTHENTICATED\n")
            return False

        # Get allowed roles from view
        allowed_roles = getattr(view, "allowed_roles", [])

        if not allowed_roles:
            print("\npermissions.py: Lacks the ROLES \n")
            return False

        # Check if user is in one of the allowed roles
        return request.user.groups.filter(name__in=allowed_roles).exists()


class IsAdmin(BasePermission):
    """
    Permission to allow access only to users in the Admin group.
    """

    def has_permission(self, request: Any, view: Any) -> bool:
        """
        Check if the user is authenticated and belongs to the Admin group.

        Args:
            request: The HTTP request object.
            view: The view being accessed.

        Returns:
            bool: True if user is in Admin group, False otherwise.
        """
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name="Admin").exists()
        )


class IsFieldOfficer(BasePermission):
    """
    Permission to allow access to users in the FieldOfficer group.
    """

    def has_permission(self, request: Any, view: Any) -> bool:
        """
        Check if the user is authenticated and belongs to the FieldOfficer group.

        Args:
            request: The HTTP request object.
            view: The view being accessed.

        Returns:
            bool: True if user is in FieldOfficer group, False otherwise.
        """
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name="FieldOfficer").exists()
        )


class IsDonor(BasePermission):
    """
    Permission to allow read-only access to users in the Donor group.
    """

    def has_permission(self, request: Any, view: Any) -> bool:
        """
        Check if the user is authenticated and belongs to the Donor group.
        Restrict to safe methods (GET, HEAD, OPTIONS).

        Args:
            request: The HTTP request object.
            view: The view being accessed.

        Returns:
            bool: True if user is in Donor group and request is safe, False otherwise.
        """
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name="Donor").exists()
            and request.method in ["GET", "HEAD", "OPTIONS"]
        )
