def test_create_task_with_defaults(client, auth_headers):
    response = client.post(
        "/api/tasks",
        headers=auth_headers,
        json={"title": "Refactor authentication flow"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Refactor authentication flow"
    assert data["category"] == "General"
    assert data["priority"] == "Medium"
    assert data["status"] == "Pending"
    assert "id" in data

def test_create_task_custom_fields(client, auth_headers):
    response = client.post(
        "/api/tasks",
        headers=auth_headers,
        json={
            "title": "Fix database connection leak",
            "description": "Connections are staying idle in transaction",
            "category": "Technical Issue",
            "priority": "High",
            "status": "In Progress"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["priority"] == "High"
    assert data["status"] == "In Progress"
    assert data["category"] == "Technical Issue"
    assert data["description"] == "Connections are staying idle in transaction"

def test_user_data_isolation(client, auth_headers, second_user_headers):
    # User 1 creates a private task
    res1 = client.post(
        "/api/tasks",
        headers=auth_headers,
        json={"title": "User 1 Secret Task"}
    )
    task1_id = res1.json()["id"]

    # User 2 creates their own task
    res2 = client.post(
        "/api/tasks",
        headers=second_user_headers,
        json={"title": "User 2 Distinct Task"}
    )
    task2_id = res2.json()["id"]

    # User 1 lists tasks — should ONLY see task 1
    list1 = client.get("/api/tasks", headers=auth_headers).json()
    task_ids1 = [t["id"] for t in list1["tasks"]]
    assert task1_id in task_ids1
    assert task2_id not in task_ids1

    # User 2 lists tasks — should ONLY see task 2
    list2 = client.get("/api/tasks", headers=second_user_headers).json()
    task_ids2 = [t["id"] for t in list2["tasks"]]
    assert task2_id in task_ids2
    assert task1_id not in task_ids2

    # User 1 tries to access User 2's task directly by ID -> MUST return 404
    get_res = client.get(f"/api/tasks/{task2_id}", headers=auth_headers)
    assert get_res.status_code == 404

    # User 1 tries to update User 2's task -> MUST return 404
    update_res = client.put(
        f"/api/tasks/{task2_id}",
        headers=auth_headers,
        json={"title": "Hacked Title"}
    )
    assert update_res.status_code == 404

    # User 1 tries to delete User 2's task -> MUST return 404
    delete_res = client.delete(f"/api/tasks/{task2_id}", headers=auth_headers)
    assert delete_res.status_code == 404

def test_update_task(client, auth_headers):
    create_res = client.post(
        "/api/tasks",
        headers=auth_headers,
        json={"title": "Initial Title", "priority": "Low"}
    )
    task_id = create_res.json()["id"]

    update_res = client.put(
        f"/api/tasks/{task_id}",
        headers=auth_headers,
        json={"title": "Updated Title", "priority": "High"}
    )
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["title"] == "Updated Title"
    assert data["priority"] == "High"

def test_patch_task_status(client, auth_headers):
    create_res = client.post(
        "/api/tasks",
        headers=auth_headers,
        json={"title": "Check status patch"}
    )
    task_id = create_res.json()["id"]

    patch_res = client.patch(
        f"/api/tasks/{task_id}/status",
        headers=auth_headers,
        json={"status": "Completed"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Completed"

def test_delete_task(client, auth_headers):
    create_res = client.post(
        "/api/tasks",
        headers=auth_headers,
        json={"title": "Task to delete"}
    )
    task_id = create_res.json()["id"]

    del_res = client.delete(f"/api/tasks/{task_id}", headers=auth_headers)
    assert del_res.status_code == 204

    # Verify task is gone
    get_res = client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert get_res.status_code == 404

def test_search_and_filter_tasks(client, auth_headers):
    client.post(
        "/api/tasks",
        headers=auth_headers,
        json={"title": "Fix frontend layout bug", "category": "Bug", "priority": "High", "status": "Pending"}
    )
    client.post(
        "/api/tasks",
        headers=auth_headers,
        json={"title": "Write API documentation", "category": "Documentation", "priority": "Low", "status": "Completed"}
    )

    # Search by keyword
    search_res = client.get("/api/tasks?search=frontend", headers=auth_headers).json()
    assert search_res["total"] == 1
    assert "frontend" in search_res["tasks"][0]["title"].lower()

    # Filter by status
    status_res = client.get("/api/tasks?status=Completed", headers=auth_headers).json()
    assert all(t["status"] == "Completed" for t in status_res["tasks"])

    # Filter by priority
    priority_res = client.get("/api/tasks?priority=High", headers=auth_headers).json()
    assert all(t["priority"] == "High" for t in priority_res["tasks"])

def test_dashboard_stats(client, auth_headers):
    client.post("/api/tasks", headers=auth_headers, json={"title": "T1", "status": "Pending", "priority": "High"})
    client.post("/api/tasks", headers=auth_headers, json={"title": "T2", "status": "In Progress", "priority": "Medium"})
    client.post("/api/tasks", headers=auth_headers, json={"title": "T3", "status": "Completed", "priority": "Low"})

    stats_res = client.get("/api/tasks/dashboard-stats", headers=auth_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_tasks"] == 3
    assert stats["pending_tasks"] == 1
    assert stats["in_progress_tasks"] == 1
    assert stats["completed_tasks"] == 1
    assert stats["high_priority_tasks"] == 1
