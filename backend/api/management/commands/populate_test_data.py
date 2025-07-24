from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
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