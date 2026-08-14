/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import Matter from "./matter/Matter";

const MatterPlugin = {
    name: _("Matter"),
    weight: 110,
    submenuId: "matter",
    path: "/matter",
    component: Matter,
    icon: "arrows-rotate",
};

ForisPlugins.push(MatterPlugin);
