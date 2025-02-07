import { redirect } from "@sveltejs/kit";
import { temp_url } from "./redirect_urls";

export default function loginRedirectFrom(url: URL) {
    return redirect(303, temp_url("/login/", url));
}
