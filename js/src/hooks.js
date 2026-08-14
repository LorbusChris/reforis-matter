/*
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useEffect } from "react";

import { API_STATE, useAlert, useAPIDelete, useAPIPost } from "foris";

/*
 * Report a failed action and refresh either way: after any mutation the page
 * should show what the router actually did, not what the click hoped for.
 */
function useActionResult(response, onDone) {
    const [setAlert] = useAlert();

    useEffect(() => {
        if (response.state === API_STATE.SUCCESS) {
            if (onDone) onDone();
            return;
        }
        if (response.state === API_STATE.ERROR) {
            setAlert(_("The request could not be carried out."));
            if (onDone) onDone();
        }
    }, [response, setAlert, onDone]);
}

export function usePostAction(url, onDone) {
    const [response, send] = useAPIPost(url);
    useActionResult(response, onDone);
    return [send, response];
}

export function useDeleteAction(url, onDone) {
    const [response, send] = useAPIDelete(url);
    useActionResult(response, onDone);
    return [send, response];
}
