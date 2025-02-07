declare module "ursa-purejs" {
    interface PublicKey {
        encrypt(
            data: string,
            inputEncoding: string,
            outputEncoding: string,
            padding: number,
        ): Buffer;
    }

    interface Ursa {
        createPublicKey(key: Buffer): PublicKey;
        RSA_PKCS1_PADDING: number;
    }

    const ursa: Ursa;
    export default ursa;
}
