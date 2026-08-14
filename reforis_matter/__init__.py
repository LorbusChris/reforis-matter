# SPDX-License-Identifier: GPL-3.0-or-later

"""Matter plugin for reForis.

The blueprint is a thin translation between HTTP and the ``matter``
foris-controller module (foris-controller-matter-module); it holds no logic of
its own.
"""

from http import HTTPStatus
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from flask_babel import gettext as _

from reforis.foris_controller_api.utils import APIError, validate_json

BASE_DIR = Path(__file__).parent

blueprint = Blueprint(
    "Matter",
    __name__,
    url_prefix="/matter/api",
)

matter = {
    "blueprint": blueprint,
    "js_app_path": "reforis_matter/js/app.min.js",
    "translations_path": BASE_DIR / "translations",
}


def _perform(module, action, data=None):
    return current_app.backend.perform(module, action, data)


def _acted(response, message):
    """Turn a module reply into an HTTP outcome."""
    if response.get("error"):
        raise APIError(message, HTTPStatus.INTERNAL_SERVER_ERROR)
    return jsonify(response)




@blueprint.route("/onboarding", methods=["GET"])
def get_onboarding():
    """Onboarding status of the Matter network manager"""
    return jsonify(_perform("matter", "get_onboarding"))


@blueprint.route("/window", methods=["POST"])
def post_window():
    """Open a commissioning window"""
    return _acted(_perform("matter", "open_window"), _("Cannot open the commissioning window"))


@blueprint.route("/window", methods=["DELETE"])
def delete_window():
    """Close the commissioning window"""
    return _acted(_perform("matter", "close_window"), _("Cannot close the commissioning window"))


@blueprint.route("/fabrics/<int:index>", methods=["DELETE"])
def delete_fabric(index):
    """Unpair a controller"""
    return _acted(
        _perform("matter", "remove_fabric", {"index": index}),
        _("Cannot remove the fabric"),
    )


@blueprint.route("/settings", methods=["GET"])
def get_settings():
    """The matter-netman configuration"""
    return jsonify(_perform("matter", "get_settings"))


@blueprint.route("/settings", methods=["POST"])
def post_settings():
    """Update the matter-netman configuration.

    The module restarts the daemon as part of the action, since the init
    script bakes these options into its command line -- a 200 here means the
    running daemon has the settings written, not merely that uci does.
    """
    validate_json(request.json, {"wifi_share": bool, "wifi_network": str})
    response = _perform("matter", "update_settings", request.json)
    if response.get("result") is not True:
        raise APIError(_("Cannot change the Matter settings"), HTTPStatus.INTERNAL_SERVER_ERROR)
    return jsonify(response)
