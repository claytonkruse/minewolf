import { redirect } from "@sveltejs/kit";
import localize_url from "./localize_url";

export default function loginRedirectFrom(url: URL) {
    return redirect(303, "/login/?from=" + localize_url(url));
}
