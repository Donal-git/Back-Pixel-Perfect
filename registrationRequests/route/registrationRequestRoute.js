import express from 'express';
import authMiddleware from '../../midllewares/authMiddleware.js';
import {
  createRequest,
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest
} from '../controller/registrationRequestController.js';

const router = express.Router();

/**
 * @swagger
 * /api/registration-requests:
 *   post:
 *     summary: Soumettre une demande de compte (public)
 *     tags:
 *       - Demandes d'inscription
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - department
 *               - position
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Jean Dupont"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@exemple.com"
 *               phone:
 *                 type: string
 *                 example: "+221 77 000 00 00"
 *               department:
 *                 type: string
 *                 example: "Comptabilité"
 *               position:
 *                 type: string
 *                 example: "Comptable"
 *     responses:
 *       201:
 *         description: Demande créée avec statut PENDING
 *       400:
 *         description: Champs obligatoires manquants
 *       409:
 *         description: Demande ou compte déjà existant pour cet email
 *       500:
 *         description: Erreur serveur
 */
router.post('/', createRequest);

/**
 * @swagger
 * /api/registration-requests:
 *   get:
 *     summary: Liste des demandes d'inscription (admin/grh)
 *     tags:
 *       - Demandes d'inscription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des demandes
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authMiddleware(['admin', 'grh']), getAllRequests);

/**
 * @swagger
 * /api/registration-requests/{id}:
 *   get:
 *     summary: Détail d'une demande (admin/grh)
 *     tags:
 *       - Demandes d'inscription
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
 *         description: Demande trouvée
 *       404:
 *         description: Demande non trouvée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authMiddleware(['admin', 'grh']), getRequestById);

/**
 * @swagger
 * /api/registration-requests/{id}/approve:
 *   patch:
 *     summary: Approuver une demande → crée le compte employé (admin)
 *     tags:
 *       - Demandes d'inscription
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
 *         description: Compte créé et email envoyé
 *       400:
 *         description: Demande déjà traitée
 *       404:
 *         description: Demande non trouvée
 *       409:
 *         description: Compte utilisateur déjà existant
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/approve', authMiddleware(['admin']), approveRequest);

/**
 * @swagger
 * /api/registration-requests/{id}/reject:
 *   patch:
 *     summary: Refuser une demande (admin)
 *     tags:
 *       - Demandes d'inscription
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
 *         description: Demande refusée
 *       400:
 *         description: Demande déjà traitée
 *       404:
 *         description: Demande non trouvée
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/reject', authMiddleware(['admin']), rejectRequest);

export default router;
