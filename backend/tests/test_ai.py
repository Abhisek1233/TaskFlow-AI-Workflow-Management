from app.services.ai_service import _rule_based_fallback, _normalize_priority

def test_ai_analyze_endpoint(client, auth_headers):
    response = client.post(
        "/api/ai/analyze-task",
        headers=auth_headers,
        json={
            "title": "Payment API returning 500 errors",
            "description": "The payment endpoint is failing for some users and needs investigation."
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "priority" in data
    assert data["priority"] in ["Low", "Medium", "High", "Urgent"]
    assert "category" in data
    assert "summary" in data
    assert "next_action" in data
    assert len(data["summary"]) > 0
    assert len(data["next_action"]) > 0

def test_ai_analyze_validation_empty_title(client, auth_headers):
    response = client.post(
        "/api/ai/analyze-task",
        headers=auth_headers,
        json={
            "title": "   ",
            "description": "Valid description"
        }
    )
    assert response.status_code == 422

def test_rule_based_fallback_logic():
    # Test urgent / critical keyword triage
    res_urgent = _rule_based_fallback(
        title="Production server outage and crash",
        description="Database connection pools exhausted",
        reason="Test invocation"
    )
    assert res_urgent.priority == "Urgent"
    assert res_urgent.category in ["Technical Issue", "DevOps & Infrastructure"]

    # Test feature request triage
    res_feature = _rule_based_fallback(
        title="Add dark mode support to frontend UI",
        description="Implement user theme preference toggle",
        reason="Test invocation"
    )
    assert res_feature.category == "Feature Request"

def test_normalize_priority_helper():
    assert _normalize_priority("HIGH") == "High"
    assert _normalize_priority("critical") == "Urgent"
    assert _normalize_priority("minor bug") == "Low"
    assert _normalize_priority("unknown") == "Medium"
