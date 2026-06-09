import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDb from './config/connectDb.js';
import seed from './config/seed.js';
import initSwagger from './swagger.js';

// Route imports
import userRoutes       from './auth/route/userRoute.js';
import departmentRoutes from './auth/route/departmentRoute.js';
import surveyRoutes     from './surveys/route/surveyRoute.js';
import formationRoutes  from './formation/route/formationRoute.js';
import roleRoutes       from './appConfig/route/roleRoute.js';
import configRoutes     from './appConfig/route/configRoute.js';
import documentRoutes            from './documents/route/documentRoute.js';
import registrationRequestRoutes from './registrationRequests/route/registrationRequestRoute.js';

dotenv.config();

const app = express();

// CORS — allow the Nuxt frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Swagger docs
initSwagger(app);

// API routes
app.use('/api/users',       userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/surveys',     surveyRoutes);
app.use('/api/formation',  formationRoutes);
app.use('/api/roles',       roleRoutes);
app.use('/api/config',      configRoutes);
app.use('/api/documents',              documentRoutes);
app.use('/api/registration-requests', registrationRequestRoutes);

app.get('/', (req, res) => res.json({ message: 'API RH opérationnelle', version: '2.0' }));

const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   await connectDb();
//   await seed(); // Initialise les données par défaut si la base est vide
//   app.listen(PORT, () => {
//     console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
//     console.log(`📚 Swagger disponible sur http://localhost:${PORT}/api-docs`);
//   });
// };


const startServer = async () => {
  try {
    await connectDb();

    if(process.env.MODE_ENV !== "production") {
      await seed(); // Initialise les données par défaut si la base est vide
      console.log("🌱 seed exécuté (en mode développement)");
    }
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démaré sur http://localhost:${PORT}`);
      console.log(`📚 Swagger disponible sur http://localhost:${PORT}/api-docs`)
    })
  } catch (error) {
    console.error("❌ Erreur au démarrage du serveur :", error);
    process.exit(1);
  }
};

startServer();
