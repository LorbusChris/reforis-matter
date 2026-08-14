/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { REFORIS_URL_PREFIX } from "foris";

const API_URL_PREFIX = `${REFORIS_URL_PREFIX}/matter/api`;

const API_URLs = new Proxy(
    {
        onboarding: "/onboarding",
        window: "/window",
        fabrics: "/fabrics",
    },
    {
        get: (target, name) => `${API_URL_PREFIX}${target[name]}`,
    }
);

export default API_URLs;
