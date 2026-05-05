import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDb from './config/connectDb.js';
import initSwagger from './swagger.js';
import userRoutes from './auth/route/userRoute.js';
import departmentRoutes from './auth/route/departmentRoute.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

initSwagger(app);

app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);

app.get('/', (req, res) => {
    res.send('API RH fonctionne');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDb();
    app.listen(PORT, () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
        console.log(`Swagger disponible sur http://localhost:${PORT}/api-docs`);
    });
};

startServer();
