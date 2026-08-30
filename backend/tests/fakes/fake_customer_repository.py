import dataclasses
from datetime import datetime
from decimal import Decimal

from app.domain.customer import Customer, CustomerStats, EmailAlreadyInUseError


class FakeCustomerRepository:
    def __init__(
        self,
        customers: list[Customer] | None = None,
        transactions: list[tuple[str, str, Decimal]] | None = None,
    ) -> None:
        self._customers = {c.id: c for c in (customers or [])}
        self._transactions = list(transactions or [])  # (customer_id, type, amount)

    def get_by_id(self, customer_id: str) -> Customer | None:
        customer = self._customers.get(customer_id)
        return dataclasses.replace(customer, address=None) if customer else None

    def get_by_identifier(self, identifier: str) -> Customer | None:
        for customer in self._customers.values():
            if customer.id == identifier or customer.email == identifier:
                return dataclasses.replace(customer, address=None)
        return None

    def get_profile(self, customer_id: str) -> Customer | None:
        return self._customers.get(customer_id)

    def update(self, customer_id: str, update_data: dict) -> Customer:
        customer = self._customers[customer_id]
        new_email = update_data.get("email")
        if new_email and any(c.email == new_email and c.id != customer_id for c in self._customers.values()):
            raise EmailAlreadyInUseError()
        updated = dataclasses.replace(customer, **update_data)
        self._customers[customer_id] = updated
        return updated

    def get_stats(self, customer_id: str, member_since: datetime) -> CustomerStats:
        entries = [t for t in self._transactions if t[0] == customer_id]
        total_earned = sum((amount for _, type_, amount in entries if type_ == "credit"), Decimal("0"))
        total_redeemed = sum((amount for _, type_, amount in entries if type_ == "debit"), Decimal("0"))
        return CustomerStats(
            total_earned=total_earned,
            total_redeemed=total_redeemed,
            transaction_count=len(entries),
            member_since=member_since,
        )
