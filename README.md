# FIRST STEP: Kwale Feeding Program Management System

Setting up the Django backend for the KFPMS step by step.

Proceed as follows:

1. **Set Up Django Project and Environment**
2. **Configure Database and Authentication**
3. **Define Models with Type Hints**
4. **Create Serializers for API**
5. **Implement Views and URLs**
6. **Add Basic Security (JWT Authentication)**

---

### Step 1: Set Up Django Project and Environment

#### Objective
Create a Django project, install dependencies, and set up the development environment.

#### Instructions
1. Ensure **Python 3.10+** is installed (`python --version`).
2. Create a virtual environment to isolate dependencies.
3. Initialize the Django project and app.

#### Code and Commands
1. **Create Virtual Environment**:
   ```bash
   python -m venv env
   source env/Scripts/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt --no-cache-dir
   ```
   - `django`: Core framework.
   - `djangorestframework`: For building RESTful APIs.
   - `django-cors-headers`: To allow frontend (React) to communicate with backend.
   - `djangorestframework-simplejwt`: For JWT authentication.

3. **Run migrations**:
   ```bash
        python manage.py makemigrations api && python manage.py migrate api
   ```
3. **Create Super user**:
   ```bash
        python manage.py  createsuperuser
   ```

3. **Create Django Project and App**:
   ```bash
   django-admin startproject kfpms_backend
   cd kfpms_backend
   django-admin startapp api
   ```

4. **Update Installed Apps** (`kfpms_backend/settings.py`):
   ```python
   from pathlib import Path
   from typing import List

   # Build paths inside the project like this: BASE_DIR / 'subdir'.
   BASE_DIR = Path(__file__).resolve().parent.parent

   # Application definition
   INSTALLED_APPS: List[str] = [
       'django.contrib.admin',
       'django.contrib.auth',
       'django.contrib.contenttypes',
       'django.contrib.sessions',
       'django.contrib.messages',
       'django.contrib.staticfiles',
       'rest_framework',
       'rest_framework_simplejwt',
       'corsheaders',
       'api',  # Custom app for KFPMS
   ]

   MIDDLEWARE: List[str] = [
       'django.middleware.security.SecurityMiddleware',
       'django.contrib.sessions.middleware.SessionMiddleware',
       'corsheaders.middleware.CorsMiddleware',  # Add CORS middleware
       'django.middleware.common.CommonMiddleware',
       'django.middleware.csrf.CsrfViewMiddleware',
       'django.contrib.auth.middleware.AuthenticationMiddleware',
       'django.contrib.messages.middleware.MessageMiddleware',
       'django.middleware.clickjacking.XFrameOptionsMiddleware',
   ]

   # CORS settings for frontend communication
   CORS_ALLOWED_ORIGINS: List[str] = [
       "http://localhost:5173",  # Vite default port for React frontend
   ]

   # REST Framework settings
   REST_FRAMEWORK = {
       'DEFAULT_AUTHENTICATION_CLASSES': (
           'rest_framework_simplejwt.authentication.JWTAuthentication',
       ),
       'DEFAULT_PERMISSION_CLASSES': (
           'rest_framework.permissions.IsAuthenticated',
       ),
   }

   # Database configuration (PostgreSQL for production, SQLite for development)
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.sqlite3',  # Use SQLite for initial setup
           'NAME': BASE_DIR / 'db.sqlite3',
       }
   }

   # Security settings
   SECRET_KEY = 'your-secret-key-here'  # Replace with a secure key in production
   DEBUG = True  # Set to False in production
   ALLOWED_HOSTS: List[str] = ['localhost', '127.0.0.1']

   # Other settings (unchanged for brevity)
   TEMPLATES = [
       {
           'BACKEND': 'django.template.backends.django.DjangoTemplates',
           'DIRS': [],
           'APP_DIRS': True,
           'OPTIONS': {
               'context_processors': [
                   'django.template.context_processors.debug',
                   'django.template.context_processors.request',
                   'django.contrib.auth.context_processors.auth',
                   'django.contrib.messages.context_processors.messages',
               ],
           },
       },
   ]

   # Static files (CSS, JavaScript, Images)
   STATIC_URL = 'static/'
   ```

5. **Verify Setup**:
   ```bash
   python manage.py runserver
   ```
   - Visit `http://localhost:8000/admin/` to ensure the server starts.
   - No models or APIs are available yet, but the Django admin should load.

---

### Step 2: Configure Database and Authentication

#### Objective
Set up PostgreSQL as the database and configure JWT authentication for secure API access.

#### Instructions
1. Install and configure PostgreSQL.
2. Update Django settings to use PostgreSQL.
3. Configure JWT authentication settings.

#### Code and Commands
1. **Install PostgreSQL**:
 Skip this part since we will use sqlite3 (Default Django DB)

2. **Update Database Settings** (`kfpms_backend/settings.py`):
  Skip this part since we will use sqlite3 (Default Django DB)

3. **Configure JWT Settings** (`kfpms_backend/settings.py`):
   ```python
   from datetime import timedelta
   from typing import Dict

   # JWT Configuration
   SIMPLE_JWT: Dict[str, any] = {
       'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
       'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
       'AUTH_HEADER_TYPES': ('Bearer',),
       'USER_ID_FIELD': 'id',
       'USER_ID_CLAIM': 'user_id',
   }
   ```
4. **Run Migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create Superuser for Admin Access**:
   ```bash
   python manage.py createsuperuser
   ```
   - Follow prompts to set username, email, and password.
   - Access the Django admin at `http://localhost:8000/admin/` to verify.

---

### Step 3: Define Models 

#### Objective
Create database models for `Beneficiary`, `Fund`, and `Transaction` to support core functionalities (beneficiary management, fund tracking).

#### Code (` kfpms_backend/api/models.py`):
```python
from django.db import models
from django.contrib.auth.models import User
from typing import Optional

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
    name: models.CharField = models.CharField(max_length=100)
    age: models.IntegerField = models.IntegerField()
    location: models.CharField = models.CharField(max_length=100)
    created_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    updated_at: models.DateTimeDateTimeField = models.DateTimeField(auto_now=True)

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
    amount: models.DecimalField = models.DecimalField(max_digits=10, decimal_places=2)
    source: models.CharField = models.CharField(max_length=100)
    allocated_at: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    description: models.TextField = models.TextField()

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

    fund: models.ForeignKey = models.ForeignKey(Fund, on_delete=models.CASCADE)
    amount: models.DecimalField = models.DecimalField(max_digits=10, decimal_places=2)
    recipient: models.CharField = models.CharField(max_length=100)
    date: models.DateTimeField = models.DateTimeField(auto_now_add=True)
    status: models.CharField = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self) -> str:
        """String representation of the Transaction model."""
        return f"{self.recipient} - {self.amount}"

    class Meta:
        """Metadata for the Transaction model."""
        verbose_name: str = "Transaction"
        verbose_name_plural: str = "Transactions"
```

**Comments**:
- Used `models.CharField`, `models.IntegerField`, etc., with type hints for clarity.
- Added comprehensive docstrings for each model and its attributes.
- Included `__str__` methods for readable model representations.
- Defined `Meta` classes for proper model naming in the admin interface.
- Used `STATUS_CHOICES` for the `Transaction` status to ensure consistency.

**Run Migrations**:
```bash
python manage.py makemigrations
python manage.py migrate
```

---

### Step 4: Create Serializers for API

#### Objective
Define serializers to convert model data to JSON for API responses.

#### Code (`kfpms_backend/api/serializers.py`):
```python
from rest_framework import serializers
from .models import Beneficiary, Fund, Transaction
from typing import Dict, Any

class BeneficiarySerializer(serializers.ModelSerializer):
    """
    Serializer for the Beneficiary model to handle JSON serialization/deserialization.
    
    Attributes:
        model (Beneficiary): The model to serialize.
        fields (str): All fields to include in the serialized output.
    """
    class Meta:
        model = Beneficiary
        fields: str = '__all__'

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
        fields: str = '__all__'

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
        fields: str = '__all__'

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate that the transaction amount does not exceed the fund's available amount."""
        fund = data.get('fund')
        amount = data.get('amount')
        if fund and amount > fund.amount:
            raise serializers.ValidationError("Transaction amount exceeds available fund.")
        return data
```

**Comments**:
- Used `serializers.ModelSerializer` to automatically generate serialization logic.
- Added type hints for validation methods (e.g., `value: int`, `data: Dict[str, Any]`).
- Included validation to ensure data integrity (e.g., positive age, valid transaction amounts).
- Comprehensive docstrings explain the purpose of each serializer.

---

### Step 5: Implement Views and URLs

#### Objective
Create RESTful API endpoints for CRUD operations on `Beneficiary`, `Fund`, and `Transaction` models.

#### Code (`kfpms_backend/api/views.py`):
```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Beneficiary, Fund, Transaction
from .serializers import BeneficiarySerializer, FundSerializer, TransactionSerializer
from typing import Type

class BeneficiaryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Beneficiary objects via REST API.
    
    Attributes:
        queryset: All Beneficiary objects.
        serializer_class: Serializer for Beneficiary model.
        permission_classes: Requires authentication for all actions.
    """
    queryset = Beneficiary.objects.all()
    serializer_class: Type[BeneficiarySerializer] = BeneficiarySerializer
    permission_classes: list = [IsAuthenticated]

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
    permission_classes: list = [IsAuthenticated]

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
    permission_classes: list = [IsAuthenticated]
```

**Comments**:
- Used `viewsets.ModelViewSet` for automatic CRUD operations (list, retrieve, create, update, delete).
- Added `IsAuthenticated` permission to restrict access to authenticated users.
- Included type hints for `serializer_class` and `permission_classes`.
- Comprehensive docstrings explain the purpose of each ViewSet.

#### Code (`kfpms_backend/api/urls.py`):
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BeneficiaryViewSet, FundViewSet, TransactionViewSet
from typing import List

router = DefaultRouter()
router.register(r'beneficiaries', BeneficiaryViewSet, basename='beneficiary')
router.register(r'funds', FundViewSet, basename='fund')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns: List = [
    path('', include(router.urls)),
]
```

#### Update Project URLs (`kfpms_backend/kfpms_backend/urls.py`):
```python
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from typing import List

urlpatterns: List = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

**Comments**:
- Used `DefaultRouter` to automatically generate API routes (e.g., `/api/beneficiaries/`).
- Included JWT token endpoints (`/api/token/` and `/api/token/refresh/`).
- Added type hints for `urlpatterns`.

---

### Step 6: Add Basic Security (JWT Authentication)

#### Objective
Ensure API endpoints are secure using JWT authentication.

#### Instructions
1. The `rest_framework_simplejwt` package is already configured.
2. Test authentication by obtaining a JWT token and accessing protected endpoints.

#### Test Authentication
1. **Start the Server**:
   ```bash
   python manage.py runserver
   ```

2. **Obtain a JWT Token**:
   - Use a tool like `curl` or Postman to send a POST request to `http://localhost:8000/api/token/`:
     ```bash
     curl -X POST http://localhost:8000/api/token/ -d "username=your_superuser&password=your_password"
     ```
     - Replace `your_superuser` and `your_password` with the superuser credentials.
     - Response will include `access` and `refresh` tokens:
       ```json
       {
         "refresh": "...",
         "access": "..."
       }
       ```

3. **Test Protected Endpoint**:
   - Access `/api/beneficiaries/` with the access token:
     ```bash
     curl -H "Authorization: Bearer your_access_token" http://localhost:8000/api/beneficiaries/
     ```


# SECOND STEP: Enhancing the backend

---

Enhancing the backend by:

1. **Implementing Role-Based Access Control (RBAC)**: 
Add user roles (e.g., Admin, Field Officer, Donor) to restrict access to API endpoints.
2. **Creating a Sync Queue Model**: 
Support offline functionality by storing pending changes for synchronization.
3. **Adding a Reporting API Endpoint**: 
Generate real-time reports for funds and transactions.
4. **Populating Test Data**: 
Create a script to add sample data for testing.


### Step 1: Implement Role-Based Access Control (RBAC)

#### Objective
Create user groups (Admin, Field Officer, Donor) and custom permissions to restrict API access based on roles. For example:
- **Admin**: Full access to all endpoints (create, read, update, delete).
- **Field Officer**: Can view and create beneficiaries/transactions but not delete funds.
- **Donor**: Read-only access to funds and reports.

#### Instructions
1. Create user groups in Django.
2. Define custom permissions for each role.
3. Update views to enforce role-based access.

#### Code
1. **Create User Groups**:

   Login into the admin panel by running the server 
   ```python 
   python manage.py runserver
   ```
   Then visit http://localhost:8000/api/admin/ then go to groups and add Admin, FieldOfficer and Donor

   Alternatively

   Run the following in a Django shell to create groups:
   ```bash
   python manage.py shell
   ```
   ```python
   from django.contrib.auth.models import Group

   # Create groups
   Group.objects.get_or_create(name='Admin')
   Group.objects.get_or_create(name='FieldOfficer')
   Group.objects.get_or_create(name='Donor')
   exit()
   ```

2. **Define Custom Permissions** (`api/permissions.py`):
  See `api/permissions.py`

3. **Update Views** (`api/views.py`):
   ```python
   from rest_framework import viewsets
   from rest_framework.permissions import IsAuthenticated
   from .models import Beneficiary, Fund, Transaction
   from .serializers import BeneficiarySerializer, FundSerializer, TransactionSerializer
   from .permissions import IsAdmin, IsFieldOfficer, IsDonor
   from typing import Type, List
   from rest_framework.permissions import BasePermission

   class BeneficiaryViewSet(viewsets.ModelViewSet):
       """
       ViewSet for managing Beneficiary objects via REST API.
       
       Permissions:
           - Admin: Full access (CRUD).
           - FieldOfficer: Create and read.
           - Donor: Read-only.
       """
       queryset = Beneficiary.objects.all()
       serializer_class: Type[BeneficiarySerializer] = BeneficiarySerializer

       def get_permissions(self) -> List[BasePermission]:
           """
           Assign permissions based on action.
           
           Returns:
               List[BasePermission]: List of permission classes.
           """
           if self.action in ['list', 'retrieve']:
               return [IsAuthenticated, (IsAdmin | IsFieldOfficer | IsDonor)]
           return [IsAuthenticated, (IsAdmin | IsFieldOfficer)]

   

### Step 2: Create a Sync Queue Model

#### Objective
Add a `SyncQueue` model to store offline changes (e.g., create/update/delete operations) for synchronization when the internet is available.

#### Code (`api/models.py`):
Append to the existing `models.py`:
```python
from django.db import models
from typing import Optional
import json

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
```

**Comments**:
- Added `SyncQueue` model to store offline operations (e.g., `{ "action": "create", "model_name": "Beneficiary", "data": {...} }`).
- Used `JSONField` to store serialized data flexibly.
- Included type hints and docstrings for clarity.
- Defined `ACTION_CHOICES` to restrict valid actions.

**Run Migrations**:
```bash
python manage.py makemigrations
python manage.py migrate
```

---

### Step 3: Add a Reporting API Endpoint

#### Objective
Create an API endpoint to generate real-time reports (e.g., total funds, transactions, beneficiaries served).

#### Code
1. **Update Serializers** (`api/serializers.py`):
   Append to the existing `serializers.py`:
   ```python
   from rest_framework import serializers
   from typing import Dict, Any

   class ReportSerializer(serializers.Serializer):
       """
       Serializer for generating program reports.
       
       Attributes:
           total_funds (float): Total amount of allocated funds.
           total_transactions (int): Total number of transactions.
           total_beneficiaries (int): Total number of beneficiaries.
       """
       total_funds: float = serializers.FloatField()
       total_transactions: int = serializers.IntegerField()
       total_beneficiaries: int = serializers.IntegerField()
   ```

2. **Create Report View** (`api/views.py`):
   Append to the existing `views.py`:
   ```python
   from rest_framework.views import APIView
   from rest_framework.response import Response
   from rest_framework import status
   from django.db.models import Sum
   from .models import Fund, Transaction, Beneficiary
   from .serializers import ReportSerializer
   from typing import Any

   class ReportView(APIView):
       """
       API view to generate real-time program reports.
       
       Permissions:
           - Admin, FieldOfficer, Donor: Read-only access.
       """
       permission_classes: List[BasePermission] = [IsAuthenticated, (IsAdmin | IsFieldOfficer | IsDonor)]

       def get(self, request: Any, *args: Any, **kwargs: Any) -> Response:
           """
           Generate a report with total funds, transactions, and beneficiaries.
           
           Args:
               request: The HTTP request object.
           
           Returns:
               Response: JSON response with report data.
           """
           try:
               total_funds: float = Fund.objects.aggregate(total=Sum('amount'))['total'] or 0.0
               total_transactions: int = Transaction.objects.count()
               total_beneficiaries: int = Beneficiary.objects.count()

               data: Dict[str, Any] = {
                   'total_funds': total_funds,
                   'total_transactions': total_transactions,
                   'total_beneficiaries': total_beneficiaries,
               }

               serializer = ReportSerializer(data)
               return Response(serializer.data, status=status.HTTP_200_OK)
           except Exception as e:
               return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   ```

3. **Update URLs** (`api/urls.py`):
   Append to the existing `urls.py`:
   ```python
   from django.urls import path
   from .views import ReportView

   urlpatterns += [
       path('reports/', ReportView.as_view(), name='reports'),
   ]
   ```

**Comments**:
- Created a `ReportSerializer` to format report data.
- Added `ReportView` to aggregate data (total funds, transactions, beneficiaries).
- Restricted access to authenticated users with appropriate roles.
- Used type hints and error handling for robustness.

**Test Report Endpoint**:
```bash
curl -H "Authorization: Bearer your_access_token" http://localhost:8000/api/reports/
```
Expected response (with no data yet):
```json
{
  "total_funds": 0.0,
  "total_transactions": 0,
  "total_beneficiaries": 0
}
```

---

### Step 4: Populate Test Data

#### Objective
Create a management command to add sample data for `Beneficiary`, `Fund`, and `Transaction` models to test the API.

#### Code (`api/management/commands/populate_test_data.py`):
```python
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Beneficiary, Fund, Transaction
from typing import Any
import random
from decimal import Decimal

class Command(BaseCommand):
    """
    Management command to populate test data for KFPMS.
    
    Usage:
        python manage.py populate_test_data
    """
    help: str = 'Populates the database with sample data for testing'

    def handle(self, *args: Any, **options: Any) -> None:
        """
        Create sample users, beneficiaries, funds, and transactions.
        
        Args:
            *args: Variable length argument list.
            **options: Arbitrary keyword arguments.
        """
        # Create a test user
        user, created = User.objects.get_or_create(
            username='testadmin',
            defaults={'email': 'admin@kfpms.org', 'is_staff': True}
        )
        if created:
            user.set_password('testpassword123')
            user.groups.add(Group.objects.get(name='Admin'))
            user.save()
            self.stdout.write(self.style.SUCCESS('Created test admin user'))

        # Create sample beneficiaries
        beneficiaries = [
            {'name': 'John Doe', 'age': 30, 'location': 'Kwale Town'},
            {'name': 'Jane Smith', 'age': 25, 'location': 'Msambweni'},
            {'name': 'Mary Johnson', 'age': 40, 'location': 'Ukunda'},
        ]
        for b in beneficiaries:
            Beneficiary.objects.get_or_create(
                name=b['name'], age=b['age'], location=b['location']
            )
        self.stdout.write(self.style.SUCCESS('Created 3 beneficiaries'))

        # Create sample funds
        funds = [
            {'amount': Decimal('10000.00'), 'source': 'NGO A', 'description': 'School feeding program'},
            {'amount': Decimal('5000.00'), 'source': 'Government', 'description': 'Community support'},
        ]
        fund_objects = []
        for f in funds:
            fund, _ = Fund.objects.get_or_create(
                amount=f['amount'], source=f['source'], description=f['description']
            )
            fund_objects.append(fund)
        self.stdout.write(self.style.SUCCESS('Created 2 funds'))

        # Create sample transactions
        for fund in fund_objects:
            Transaction.objects.get_or_create(
                fund=fund,
                amount=Decimal(str(random.uniform(100.00, 1000.00))) // 1,
                recipient='Community Center',
                status='completed'
            )
        self.stdout.write(self.style.SUCCESS('Created transactions'))
```

**Run Command**:
```bash
python manage.py populate_test_data
```

**Test Data**:
- Check the Django admin (`http://localhost:8000/admin/`) to verify beneficiaries, funds, and transactions.
- Test the report endpoint again to see updated data:
  ```bash
  curl -H "Authorization: Bearer your_access_token" http://localhost:8000/api/reports/
  ```

# THIRD STEP: Implement Sync Endpoint for Offline Functionality

#### Objective
Create a sync endpoint (`/api/sync/`) to process `SyncQueue` entries sent from the frontend when it regains internet connectivity. The endpoint will handle queued operations (create, update, delete) for `Beneficiary`, `Fund`, and `Transaction` models, ensuring data consistency between offline and online states.

#### Instructions
1. Create a serializer for `SyncQueue` to validate incoming sync requests.
2. Implement a sync view to process queued operations.
3. Update URLs to include the sync endpoint.
4. Test the endpoint with sample sync data.

#### Code
1. **Update Serializers** (`backend/api/serializers.py`):
   Append to the existing `serializers.py`:
   ```python
   from rest_framework import serializers
   from .models import SyncQueue
   from typing import Dict, Any

   class SyncQueueSerializer(serializers.ModelSerializer):
       """
       Serializer for the SyncQueue model to handle synchronization requests.
       
       Attributes:
           model (SyncQueue): The model to serialize.
           fields (str): All fields to include in the serialized output.
       """
       class Meta:
           model = SyncQueue
           fields: str = '__all__'

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
           valid_models = ['Beneficiary', 'Fund', 'Transaction']
           
           if data['action'] not in valid_actions:
               raise serializers.ValidationError(f"Invalid action: {data['action']}")
           if data['model_name'] not in valid_models:
               raise serializers.ValidationError(f"Invalid model_name: {data['model_name']}")
           
           return data
   ```

   **Comments**:
   - Added `SyncQueueSerializer` to validate `action`, `model_name`, and `data` fields.
   - Included validation to ensure only valid actions and model names are processed.
   - Used type hints (`Dict[str, Any]`) and docstrings for clarity.

2. **Create Sync View** (`backend/api/views.py`):
   Append to the existing `views.py`:
   ```python
   from rest_framework.views import APIView
   from rest_framework.response import Response
   from rest_framework import status
   from .models import Beneficiary, Fund, Transaction, SyncQueue
   from .serializers import BeneficiarySerializer, FundSerializer, TransactionSerializer, SyncQueueSerializer
   from .permissions import IsAuthenticatedAndRole
   from typing import Any, Dict, List
   from django.db import transaction as db_transaction

   class SyncView(APIView):
       """
       API view to process sync queue entries from offline clients.
       
       Permissions:
           - Admin, FieldOfficer: Can process sync operations for create/update/delete.
       """
       permission_classes: List[BasePermission] = [
           IsAuthenticatedAndRole(allowed_roles=['Admin', 'FieldOfficer'])
       ]

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
               sync_entries = request.data if isinstance(request.data, list) else [request.data]
               results = []

               with db_transaction.atomic():
                   for entry in sync_entries:
                       serializer = SyncQueueSerializer(data=entry)
                       if not serializer.is_valid():
                           results.append({
                               'entry': entry,
                               'status': 'error',
                               'error': serializer.errors
                           })
                           continue

                       action = serializer.validated_data['action']
                       model_name = serializer.validated_data['model_name']
                       data = serializer.validated_data['data']

                       try:
                           if model_name == 'Beneficiary':
                               self._process_beneficiary(action, data)
                           elif model_name == 'Fund':
                               self._process_fund(action, data)
                           elif model_name == 'Transaction':
                               self._process_transaction(action, data)
                           results.append({'entry': entry, 'status': 'success'})
                       except Exception as e:
                           results.append({'entry': entry, 'status': 'error', 'error': str(e)})

               return Response({'results': results}, status=status.HTTP_200_OK)
           except Exception as e:
               return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

       def _process_beneficiary(self, action: str, data: Dict[str, Any]) -> None:
           """
           Process a sync operation for the Beneficiary model.
           
           Args:
               action (str): The action to perform (create, update, delete).
               data (Dict[str, Any]): The data for the operation.
           
           Raises:
               ValueError: If the action is invalid or data is missing required fields.
           """
           if action == 'create':
               serializer = BeneficiarySerializer(data=data)
               if serializer.is_valid():
                   serializer.save()
               else:
                   raise ValueError(serializer.errors)
           elif action == 'update':
               instance = Beneficiary.objects.get(id=data.get('id'))
               serializer = BeneficiarySerializer(instance, data=data, partial=True)
               if serializer.is_valid():
                   serializer.save()
               else:
                   raise ValueError(serializer.errors)
           elif action == 'delete':
               Beneficiary.objects.get(id=data.get('id')).delete()

       def _process_fund(self, action: str, data: Dict[str, Any]) -> None:
           """
           Process a sync operation for the Fund model.
           
           Args:
               action (str): The action to perform (create, update, delete).
               data (Dict[str, Any]): The data for the operation.
           
           Raises:
               ValueError: If the action is invalid or data is missing required fields.
           """
           if action == 'create':
               serializer = FundSerializer(data=data)
               if serializer.is_valid():
                   serializer.save()
               else:
                   raise ValueError(serializer.errors)
           elif action == 'update':
               instance = Fund.objects.get(id=data.get('id'))
               serializer = FundSerializer(instance, data=data, partial=True)
               if serializer.is_valid():
                   serializer.save()
               else:
                   raise ValueError(serializer.errors)
           elif action == 'delete':
               Fund.objects.get(id=data.get('id')).delete()

       def _process_transaction(self, action: str, data: Dict[str, Any]) -> None:
           """
           Process a sync operation for the Transaction model.
           
           Args:
               action (str): The action to perform (create, update, delete).
               data (Dict[str, Any]): The data for the operation.
           
           Raises:
               ValueError: If the action is invalid or data is missing required fields.
           """
           if action == 'create':
               serializer = TransactionSerializer(data=data)
               if serializer.is_valid():
                   serializer.save()
               else:
                   raise ValueError(serializer.errors)
           elif action == 'update':
               instance = Transaction.objects.get(id=data.get('id'))
               serializer = TransactionSerializer(instance, data=data, partial=True)
               if serializer.is_valid():
                   serializer.save()
               else:
                   raise ValueError(serializer.errors)
           elif action == 'delete':
               Transaction.objects.get(id=data.get('id')).delete()
   ```

   **Comments**:
   - Created `SyncView` to handle POST requests with a list of sync queue entries.
   - Used `db_transaction.atomic()` to ensure database consistency.
   - Added helper methods (`_process_beneficiary`, `_process_fund`, `_process_transaction`) to handle model-specific operations.
   - Restricted access to `Admin` and `FieldOfficer` roles using `IsAuthenticatedAndRole`.
   - Included error handling and detailed response for each entry.
   - Used type hints (`Dict[str, Any]`, `List[BasePermission]`) and docstrings.

3. **Update URLs** (`backend/api/urls.py`):
   Append to the existing `urls.py`:
   ```python
   from django.urls import path
   from .views import SyncView

   urlpatterns += [
       path('sync/', SyncView.as_view(), name='sync'),
   ]
   ```

   **Comments**:
   - Added `/api/sync/` endpoint to the URL configuration.
   - Ensured consistency with existing router-based URLs.

4. **Test the Sync Endpoint**:
   - **Start the Server**:
     ```bash
     python manage.py runserver
     ```
   - **Get a JWT Token**:
     ```bash
     curl -X POST http://localhost:8000/api/token/ -d "username=peter&password=1234"
     ```
     Copy the `access` token.
   - **Test Sync Endpoint**:
     Send a POST request with sample sync data:
     ```bash
     curl -X POST -H "Authorization: Bearer your_access_token" -H "Content-Type: application/json" http://localhost:8000/api/sync/ -d '[
       {
         "action": "create",
         "model_name": "Beneficiary",
         "data": {"name": "Sync Test User", "age": 28, "location": "Ukunda"}
       },
       {
         "action": "create",
         "model_name": "Fund",
         "data": {"amount": 5000.00, "source": "Test NGO", "description": "Sync test fund"}
       }
     ]'
     ```
     Expected response:
     ```json
     {
       "results": [
         {
           "entry": {
             "action": "create",
             "model_name": "Beneficiary",
             "data": {"name": "Sync Test User", "age": 28, "location": "Ukunda"}
           },
           "status": "success"
         },
         {
           "entry": {
             "action": "create",
             "model_name": "Fund",
             "data": {"amount": 5000.00, "source": "Test NGO", "description": "Sync test fund"}
           },
           "status": "success"
         }
       ]
     }
     ```
   - **Verify Data**:
     Check the Django admin (`http://localhost:8000/admin/api/beneficiary/`, `/admin/api/fund/`) to confirm the new records.



