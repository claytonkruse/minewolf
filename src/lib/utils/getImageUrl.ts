// browser only: does not work in node

export function getImageURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (!reader.result) return reject(new Error("No result"));
            resolve(reader.result?.toString());
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
}
