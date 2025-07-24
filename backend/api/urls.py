from django.urls import path
from .views import (
    BeneficiaryViewSet,
    FundViewSet,
    TransactionViewSet,
    StatsView,
    VerifyTokenView,
    ProfileView,
)

app_name = "api"

urlpatterns = [
    path("auth/profile/", ProfileView.as_view(), name="profile"),
    path(
        "beneficiaries/",
        BeneficiaryViewSet.as_view({"get": "list", "post": "create"}),
        name="beneficiary-list",
    ),
    path(
        "beneficiaries/<int:pk>/",
        BeneficiaryViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
        name="beneficiary-detail",
    ),
    path(
        "funds/",
        FundViewSet.as_view({"get": "list", "post": "create"}),
        name="fund-list",
    ),
    path(
        "funds/<int:pk>/",
        FundViewSet.as_view({"get": "retrieve", "put": "update", "delete": "destroy"}),
        name="fund-detail",
    ),
    path(
        "transactions/",
        TransactionViewSet.as_view({"get": "list", "post": "create"}),
        name="transaction-list",
    ),
    path(
        "transactions/<int:pk>/",
        TransactionViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
        name="transaction-detail",
    ),
    path("stats/", StatsView.as_view(), name="stats"),
    path("auth/verify/", VerifyTokenView.as_view(), name="token_verify"),
]
