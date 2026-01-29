import PocketBase from "pocketbase";

const pocketbaseEmail = import.meta.env.VITE_POCKETBASE_SUPERUSER_EMAIL;
const pocketbasePassword = import.meta.env.VITE_POCKETBASE_SUPERUSER_PASSWORD;

const pb = new PocketBase('http://127.0.0.1:8090');
pb.autoCancellation(false);

try {
    if (pocketbaseEmail && pocketbasePassword) {
        await pb.collection('_superusers').authWithPassword(
            pocketbaseEmail, 
            pocketbasePassword
        );
    }
} catch (error) {
    console.error("PocketBase auth failed:", error);
}

export default pb;