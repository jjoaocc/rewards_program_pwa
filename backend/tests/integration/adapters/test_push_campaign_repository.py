from app.adapters.db.push_campaign_repository import SqlAlchemyPushCampaignRepository


def test_create_and_record_result_roundtrip(db_session):
    repo = SqlAlchemyPushCampaignRepository(db_session)

    campaign = repo.create(
        "Título", "Mensagem", "/", target_type="broadcast", target_customer_ids=None, customers_targeted=5
    )
    assert campaign.sent == 0

    repo.record_result(campaign.id, sent=4, failed=1, removed=0)

    updated = repo.list_recent(limit=1)[0]
    assert updated.id == campaign.id
    assert updated.sent == 4
    assert updated.failed == 1


def test_list_recent_orders_by_most_recent_first(db_session):
    repo = SqlAlchemyPushCampaignRepository(db_session)
    repo.create("Antiga", "m", "/", target_type="broadcast", target_customer_ids=None, customers_targeted=1)
    repo.create("Recente", "m", "/", target_type="broadcast", target_customer_ids=None, customers_targeted=1)

    result = repo.list_recent(limit=10)

    assert result[0].title == "Recente"
