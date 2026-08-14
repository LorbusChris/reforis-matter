/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import React from "react";

import { render, wait } from "foris/testUtils/customTestRender";
import { mockJSONError } from "foris/testUtils/network";
import mockAxios from "jest-mock-axios";

import Matter from "../Matter";

describe("<Matter/>", () => {
    it("tells a failed request apart from Matter being absent", async () => {
        /*
         * An error reply is truthy data too. Rendering the "not installed"
         * copy for it once sent a debugging session to the wrong package, so
         * the two must never share a screen.
         */
        const { queryByText } = render(<Matter />);
        mockJSONError();
        await wait(() => {
            expect(queryByText(/An error occurred/)).not.toBeNull();
            expect(queryByText(/No Matter network manager/)).toBeNull();
        });
    });

    it("reports absence only when a reply actually said so", async () => {
        const { queryByText } = render(<Matter />);
        mockAxios.mockResponse({ data: { present: false } });
        await wait(() => {
            expect(queryByText(/No Matter network manager/)).not.toBeNull();
        });
    });

    it("holds the pairing code back while the window is closed", async () => {
        const { queryByText } = render(<Matter />);
        mockAxios.mockResponse({
            data: {
                present: true,
                live: true,
                commissioned: true,
                fabrics: 1,
                fabric_list: [{ Index: 3, VendorId: 4939, Label: "Home" }],
                thread_managed: true,
                window: "closed",
            },
        });
        await wait(() => {
            expect(queryByText(/No commissioning window is open/)).not.toBeNull();
            expect(queryByText("Manual pairing code")).toBeNull();
        });
    });
});
