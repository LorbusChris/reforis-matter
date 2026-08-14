/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React, { useCallback, useEffect } from "react";

import {
    API_STATE,
    Button,
    CopyInput,
    ErrorMessage,
    Spinner,
    formFieldsSize,
    useAPIGet,
} from "foris";

import API_URLs from "API";

import { useDeleteAction, usePostAction } from "../hooks";

const POLL_INTERVAL = 5000;

export default function Matter() {
    const [onboarding, getOnboarding] = useAPIGet(API_URLs.onboarding);

    const refresh = useCallback(() => getOnboarding(), [getOnboarding]);

    useEffect(() => {
        refresh();
        const timer = setInterval(refresh, POLL_INTERVAL);
        return () => clearInterval(timer);
    }, [refresh]);

    const [openWindow] = usePostAction(API_URLs.window, refresh);
    const [closeWindow] = useDeleteAction(API_URLs.window, refresh);
    const [removeFabric] = useDeleteAction(API_URLs.fabrics, refresh);

    /*
     * A failed request is not the same thing as Matter being absent: an error
     * reply is truthy data too, and rendering the "not installed" copy for it
     * once sent a debugging session to the wrong package. The distinction is
     * data.present === false from a reply that actually arrived.
     */
    if (onboarding.state === API_STATE.ERROR) {
        return (
            <>
                <h1>{_("Matter")}</h1>
                <ErrorMessage />
            </>
        );
    }
    // While a poll is in flight the previous data stays; only the very first
    // load has none.
    if (!onboarding.data) return <Spinner />;

    const { data } = onboarding;

    if (!data.present) {
        return (
            <>
                <h1>{_("Matter")}</h1>
                <p>
                    {_(
                        "No Matter network manager is installed on this router. Install the matter-netman package to expose this router on a Matter fabric."
                    )}
                </p>
            </>
        );
    }

    if (!data.live) {
        return (
            <>
                <h1>{_("Matter")}</h1>
                <div className="alert alert-warning">
                    {_(
                        "The Matter network manager is installed but is not answering, so no commissioning window can be opened. Check that its service is running."
                    )}
                </div>
                <p>
                    {data.commissioned
                        ? _(
                              "This router has been commissioned onto at least one fabric."
                          )
                        : _(
                              "This router has not been commissioned onto any fabric."
                          )}
                </p>
            </>
        );
    }

    const windowOpen = data.window === "basic" || data.window === "enhanced";

    return (
        <>
            <h1>{_("Matter")}</h1>

            <h2>{_("Commissioning")}</h2>
            <p>
                {windowOpen
                    ? _(
                          "A commissioning window is open. Pair this router with a controller using the code below."
                      )
                    : _(
                          "No commissioning window is open. The pairing code only works while one is, so it is not shown until you open one."
                      )}
            </p>

            {windowOpen && data.manual_code && (
                <div className={formFieldsSize}>
                    <CopyInput
                        label={_("Manual pairing code")}
                        value={data.manual_code}
                        readOnly
                    />
                    {data.qr && (
                        <CopyInput
                            label={_("QR payload")}
                            value={data.qr}
                            readOnly
                        />
                    )}
                    {data.qr_svg && (
                        <div
                            className="mb-3"
                            /*
                             * Rendered by qrencode on the router from a payload
                             * the backend checks against the onboarding
                             * alphabet before it ever reaches a command line.
                             */
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{ __html: data.qr_svg }}
                        />
                    )}
                </div>
            )}

            <div className="mb-4">
                {windowOpen ? (
                    <Button
                        className="btn-secondary"
                        onClick={() => closeWindow()}
                    >
                        {_("Close commissioning window")}
                    </Button>
                ) : (
                    <Button
                        className="btn-primary"
                        onClick={() => openWindow()}
                    >
                        {_("Open commissioning window")}
                    </Button>
                )}
            </div>

            <h2>{_("Fabrics")}</h2>
            <p>
                {data.thread_managed
                    ? _(
                          "This router manages the Thread network for its fabrics."
                      )
                    : _(
                          "This router does not manage a Thread network for its fabrics."
                      )}
            </p>
            {(data.fabric_list || []).length === 0 ? (
                <p className="text-muted">
                    {_("No controller has commissioned this router yet.")}
                </p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>{_("Index")}</th>
                                <th>{_("Label")}</th>
                                <th>{_("Vendor ID")}</th>
                                <th aria-label={_("Actions")} />
                            </tr>
                        </thead>
                        <tbody>
                            {data.fabric_list.map((fabric) => (
                                <tr key={fabric.Index}>
                                    <td>{fabric.Index}</td>
                                    <td>{fabric.Label || "—"}</td>
                                    <td>{fabric.VendorId}</td>
                                    <td className="text-end">
                                        <Button
                                            className="btn-sm btn-outline-danger"
                                            onClick={() =>
                                                removeFabric({
                                                    suffix: String(
                                                        fabric.Index
                                                    ),
                                                })
                                            }
                                        >
                                            {_("Unpair")}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
