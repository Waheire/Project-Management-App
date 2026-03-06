import mongoose from "mongoose";
import { config } from "./app.config";

const connectDatabase = async () => {
    try {
        mongoose.set("debug", true);

        console.log("MONGO_URI loaded:", Boolean(config.MONGO_URI));
        await mongoose.connect(config.MONGO_URI, {
            // these are safe defaults; also helps with some Atlas TLS edge cases
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });

        console.log("Connected to Mongo database");
    } catch (error) {
        console.error("Mongo connection error (full):", error);
        // also print common nested fields
        const err: any = error;
        console.error("name:", err?.name);
        console.error("message:", err?.message);
        console.error("cause:", err?.cause);
        console.error("reason:", err?.reason);
        process.exit(1);
    }
};

export default connectDatabase;