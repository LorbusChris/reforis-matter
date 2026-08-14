/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React, { useEffect, useState } from "react";

import {
    Button,
    CheckBox,
    Spinner,
    TextInput,
    formFieldsSize,
    useAPIGet,
} from "foris";

import API_URLs from "API";

import { usePostAction } from "../hooks";

/*
 * What matter-netman reads from uci at startup. The daemon is restarted by
 * the backend as part of a save, so a successful save means the controllers
 * already talk to a daemon running these settings.
 */
export default function MatterSettings() {
    const [settings, getSettings] = useAPIGet(API_URLs.settings);
    const [form, setForm] = useState(null);

    useEffect(() => {
        getSettings();
    }, [getSettings]);

    useEffect(() => {
        if (settings.data && settings.data.wifi_network !== undefined) {
            setForm(settings.data);
        }
    }, [settings.data]);

    const [save, saveState] = usePostAction(API_URLs.settings, getSettings);

    if (!form) return <Spinner />;

    const update = (field) => (event) =>
        setForm({ ...form, [field]: event.target.value });
    const updateFlag = (field) => (event) =>
        setForm({ ...form, [field]: event.target.checked });

    return (
        <div className={formFieldsSize}>
            <h2>{_("Settings")}</h2>
            <CheckBox
                label={_("Share Wi-Fi credentials")}
                checked={form.wifi_share}
                onChange={updateFlag("wifi_share")}
                helpText={_(
                    "Let paired controllers read the access point credentials, so they can onboard Wi-Fi devices onto the same network."
                )}
            />
            <TextInput
                label={_("Wi-Fi network")}
                value={form.wifi_network}
                onChange={update("wifi_network")}
                disabled={!form.wifi_share}
                helpText={_(
                    "The network whose access point credentials are shared; usually lan."
                )}
            />
            <TextInput
                label={_("Wi-Fi interface")}
                value={form.wifi_iface}
                onChange={update("wifi_iface")}
                disabled={!form.wifi_share}
                helpText={_(
                    "Pin a specific wifi-iface section instead of the automatic choice. Leave empty for automatic."
                )}
            />
            <TextInput
                label={_("Primary interface")}
                value={form.primary_interface}
                onChange={update("primary_interface")}
                helpText={_(
                    "The interface this device reports itself reachable on, usually br-lan."
                )}
            />
            <CheckBox
                label={_("Ethernet diagnostics")}
                checked={form.ethernet_diagnostics}
                onChange={updateFlag("ethernet_diagnostics")}
                helpText={_(
                    "Interface state and traffic counters are readable by every paired controller. Uncheck to report none of them."
                )}
            />
            <TextInput
                label={_("Diagnostics interface")}
                value={form.diagnostics_interface}
                onChange={update("diagnostics_interface")}
                disabled={!form.ethernet_diagnostics}
                helpText={_(
                    "Take the Ethernet diagnostics from this interface instead of the primary one, to report a port rather than a bridge. Leave empty for the primary."
                )}
            />
            <TextInput
                label={_("Vendor name")}
                value={form.vendor_name}
                onChange={update("vendor_name")}
                helpText={_(
                    "The manufacturer reported in Basic Information. Leave empty for the firmware's own."
                )}
            />
            <TextInput
                label={_("Product name")}
                value={form.product_name}
                onChange={update("product_name")}
                helpText={_(
                    "The product reported in Basic Information. Leave empty for the distribution name."
                )}
            />
            <Button
                className="btn-primary"
                loading={saveState.state === "sending"}
                disabled={!form.wifi_network || !form.primary_interface}
                onClick={() => save({ data: form })}
            >
                {_("Save")}
            </Button>
            <p className="text-muted mt-2">
                {_(
                    "Saving restarts the Matter service; paired controllers reconnect on their own."
                )}
            </p>
        </div>
    );
}
