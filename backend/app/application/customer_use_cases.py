from datetime import datetime

from app.domain.customer import Customer, CustomerStats
from app.ports.customer_repository import CustomerRepository


def get_profile(repo: CustomerRepository, customer_id: str) -> Customer | None:
    return repo.get_profile(customer_id)


def update_profile(repo: CustomerRepository, customer_id: str, update_data: dict) -> Customer:
    return repo.update(customer_id, update_data)


def get_stats(repo: CustomerRepository, customer_id: str, member_since: datetime) -> CustomerStats:
    return repo.get_stats(customer_id, member_since)
