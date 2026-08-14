# SPDX-License-Identifier: GPL-3.0-or-later

"""Blueprint tests.

The blueprint carries no rules of its own, so what is worth testing here is the
translation: that each route reaches the module action it claims to, and an error is an
error rather than a silent success.
"""

from http import HTTPStatus

from reforis.test_utils import mock_backend_response

API = "/matter/api"


@mock_backend_response({"matter": {"get_onboarding": {"present": True, "live": True}}})
def test_matter_onboarding(client):
    response = client.get(f"{API}/onboarding")
    assert response.status_code == HTTPStatus.OK
    assert response.json["present"] is True


@mock_backend_response({"matter": {"open_window": {"error": 0, "window": "basic"}}})
def test_matter_open_window(client):
    response = client.post(f"{API}/window")
    assert response.status_code == HTTPStatus.OK
    assert response.json["window"] == "basic"


@mock_backend_response({"matter": {"remove_fabric": {"error": 0, "fabrics": 0}}})
def test_matter_remove_fabric(client):
    response = client.delete(f"{API}/fabrics/1")
    assert response.status_code == HTTPStatus.OK


SETTINGS = {
    "wifi_share": True,
    "wifi_network": "lan",
    "wifi_iface": "",
    "primary_interface": "br-lan",
    "vendor_name": "",
    "product_name": "",
    "ethernet_diagnostics": True,
    "diagnostics_interface": "",
}


@mock_backend_response({"matter": {"get_settings": SETTINGS}})
def test_get_settings(client):
    response = client.get(f"{API}/settings")
    assert response.status_code == HTTPStatus.OK
    assert response.json["wifi_network"] == "lan"


@mock_backend_response({"matter": {"update_settings": {"result": True}}})
def test_update_settings(client):
    response = client.post(f"{API}/settings", json=SETTINGS)
    assert response.status_code == HTTPStatus.OK


@mock_backend_response({"matter": {"update_settings": {"result": False}}})
def test_update_settings_failure_is_an_error(client):
    response = client.post(f"{API}/settings", json=SETTINGS)
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR


@mock_backend_response({"matter": {"update_settings": {"result": True}}})
def test_update_settings_invalid_json(client):
    response = client.post(f"{API}/settings", json={"wifi_share": True})
    assert response.status_code == HTTPStatus.BAD_REQUEST
