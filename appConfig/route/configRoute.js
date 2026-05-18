import express from 'express';
import { getConfig, updateConfig } from '../controller/configController.js';
import authMiddleware from '../../midllewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Récupérer la configuration de l'application
 *     tags:
 *       - Configuration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration actuelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authMiddleware(['admin']), getConfig);

/**
 * @swagger
 * /api/config:
 *   put:
 *     summary: Modifier la configuration de l'application
 *     tags:
 *       - Configuration
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Configuration mise à jour
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.put('/', authMiddleware(['admin']), updateConfig);

export default router;
