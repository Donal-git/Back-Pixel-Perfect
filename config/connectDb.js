import mongoose from "mongoose";

const connectDb = async () => { 
    try{
        const mongoUri = process.env.MONGO_URI;
        if(!mongoUri){
            throw new Error("MongoDB URI non défini dans les variables d'environnement");
        }
        await mongoose.connect(mongoUri);
        console.log("MongoDB connecté avec succès");
        } catch (error) {
            console.error("Erreur de connexion à MongoDB:", error);
            process.exit(1); // Arrêter l'application en cas d'erreur de connexion
        }
    };

export default connectDb;