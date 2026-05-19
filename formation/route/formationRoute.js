import express from 'express';
import {
  getAllFormations, getFormationById, createFormation,
  updateFormation, deleteFormation
} from '../controller/formationController.js';
import {
  registerForFormation, unregisterFromFormation, checkRegistration,
  getFormationRegistrations, getMyFormations, updateRegistrationStatus
} from '../controller/registrationController.js';
import authMiddleware from '../../midllewares/authMiddleware.js';

const router = express.Router();

// Toutes les routes formation nécessitent une authentification
router.use(authMiddleware());

/**
 * @swagger
 * /api/formations/my:
 *   get:
 *     summary: Mes formations inscrites (employé)
 *     tags:
 *       - Formations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de mes formations
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/my', authMiddleware(), getMyFormations);

/**
 * @swagger
 * /api/formations:
 *   get:
 *     summary: Liste de toutes les formations
 *     tags:
 *       - Formations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des formations
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authMiddleware(), getAllFormations);

/**
 * @swagger
 * /api/formations/{id}:
 *   get:
 *     summary: Récupérer une formation par son ID
 *     tags:
 *       - Formations
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
 *         description: Formation trouvée
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Formation non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authMiddleware(), getFormationById);

/**
 * @swagger
 * /api/formations:
 *   post:
 *     summary: Créer une formation
 *     tags:
 *       - Formations
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
 *               - startDate
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               maxParticipants:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Formation créée
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post('/', authMiddleware(['grh']), createFormation);

/**
 * @swagger
 * /api/formations/{id}:
 *   put:
 *     summary: Modifier une formation
 *     tags:
 *       - Formations
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
 *         description: Formation mise à jour
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Formation non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authMiddleware(['grh']), updateFormation);

/**
 * @swagger
 * /api/formations/{id}:
 *   delete:
 *     summary: Supprimer une formation
 *     tags:
 *       - Formations
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
 *         description: Formation supprimée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Formation non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authMiddleware(['grh']), deleteFormation);

/**
 * @swagger
 * /api/formations/{id}/register:
 *   post:
 *     summary: S'inscrire à une formation
 *     tags:
 *       - Formations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Inscription enregistrée
 *       400:
 *         description: Déjà inscrit ou formation complète
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Formation non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.post('/:id/register', authMiddleware(), registerForFormation);

/**
 * @swagger
 * /api/formations/{id}/register:
 *   delete:
 *     summary: Se désinscrire d'une formation
 *     tags:
 *       - Formations
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
 *         description: Désinscription effectuée
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Inscription non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id/register', authMiddleware(), unregisterFromFormation);

/**
 * @swagger
 * /api/formations/{id}/registration:
 *   get:
 *     summary: Vérifier mon inscription à une formation
 *     tags:
 *       - Formations
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
 *         description: Statut d'inscription
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id/registration', authMiddleware(), checkRegistration);

/**
 * @swagger
 * /api/formations/{id}/registrations:
 *   get:
 *     summary: Toutes les inscriptions d'une formation (admin/grh)
 *     tags:
 *       - Formations
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
 *         description: Liste des inscriptions
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Formation non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id/registrations', authMiddleware(['admin', 'grh']), getFormationRegistrations);

/**
 * @swagger
 * /api/formations/registrations/{regId}/status:
 *   patch:
 *     summary: Mettre à jour le statut d'une inscription
 *     tags:
 *       - Formations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: regId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Inscription non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.patch('/registrations/:regId/status', authMiddleware(['admin', 'grh']), updateRegistrationStatus);

export default router;
