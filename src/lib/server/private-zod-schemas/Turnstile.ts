import { z } from "zod";
import { CLOUDFLARE_TURNSTILE_SECRET_KEY } from "$env/static/private";

interface TokenValidateResponse {
    "error-codes": string[];
    success: boolean;
    action: string;
    cdata: string;
}

async function validateToken(token: string, secret: string) {
    const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                response: token,
                secret: secret,
            }),
        },
    );

    const data: TokenValidateResponse = await response.json();

    return {
        // Return the status
        success: data.success,

        // Return the first error if it exists
        error: data["error-codes"]?.length ? data["error-codes"][0] : null,
    };
}

export const TurnstileSchema = z
    .string({ required_error: "CAPTCHA error." })
    .refine(
        async (token) => {
            const { success, error: trError } = await validateToken(
                token,
                CLOUDFLARE_TURNSTILE_SECRET_KEY,
            );
            console.log("Ran validation on CAPTCHA: " + token);
            if (!success) {
                console.log("CAPTCHA validation failed");
                console.error("Capcha Error: " + trError);
                return false;
            }
            return true;
        },
        { message: "CAPTCHA error." },
    );
