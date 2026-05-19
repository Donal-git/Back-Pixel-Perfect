import express from 'express';
import {
  getAllSurveys, getSurveyById, createSurvey,
  updateSurvey, deleteSurvey, sendSurvey
} from '../controller/surveyController.js';
import {
  upsertResponse, getMyResponse,
  getSurveyResponses, getEmployeeResponses
} from '../controller/surveyResponseController.js';
import authMiddleware from '../../midllewares/authMiddleware.js';

const router = express.Router();
// Toutes les routes sondages nécessitent une authentification
router.use(authMiddleware());

/**
 * @swagger
 * /api/surveys:
 *   get:
 *     summary: Liste de tous les sondages
 *     tags:
 *       - Sondages
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des sondages
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/', getAllSurveys);

/**
 * @swagger
 * /api/surveys/responses/mine:
 *   get:
 *     summary: Mes réponses à tous les sondages (employé)
 *     tags:
 *       - Sondages
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mes réponses
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/responses/mine', authMiddleware(), getEmployeeResponses);

/**
 * @swagger
 * /api/surveys/{id}:
 *   get:
 *     summary: Récupérer un sondage par son ID
 *     tags:
 *       - Sondages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sondage trouvé
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Sondage non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', getSurveyById);

/**
 * @swagger
 * /api/surveys:
 *   post:
 *     summary: Créer un sondage
 *     tags:
 *       - Sondages
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - questions
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Sondage créé
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authMiddleware(['grh']), createSurvey);

/**
 * @swagger
 * /api/surveys/{id}:
 *   put:
 *     summary: Modifier un sondage
 *     tags:
 *       - Sondages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Sondage mis à jour
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Sondage non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authMiddleware(['grh']), updateSurvey);

/**
 * @swagger
 * /api/surveys/{id}:
 *   delete:
 *     summary: Supprimer un sondage
 *     tags:
 *       - Sondages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sondage supprimé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Sondage non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authMiddleware(['grh']), deleteSurvey);

/**
 * @swagger
 * /api/surveys/{id}/send:
 *   post:
 *     summary: Envoyer un sondage aux employés
 *     tags:
 *       - Sondages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sondage envoyé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Sondage non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/:id/send', authMiddleware(['grh']), sendSurvey);

/**
 * @swagger
 * /api/surveys/{id}/responses:
 *   post:
 *     summary: Soumettre ou mettre à jour ma réponse à un sondage
 *     tags:
 *       - Sondages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Réponse enregistrée
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Sondage non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/:id/responses', authMiddleware(), upsertResponse);

/**
 * @swagger
 * /api/surveys/{id}/responses:
 *   get:
 *     summary: Toutes les réponses d'un sondage (admin/grh)
 *     tags:
 *       - Sondages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des réponses
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Sondage non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id/responses', authMiddleware(['admin', 'grh']), getSurveyResponses);

/**
 * @swagger
 * /api/surveys/{id}/responses/mine:
 *   get:
 *     summary: Ma réponse à un sondage spécifique
 *     tags:
 *       - Sondages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ma réponse
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Sondage non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id/responses/mine', authMiddleware(), getMyResponse);

export default router;
