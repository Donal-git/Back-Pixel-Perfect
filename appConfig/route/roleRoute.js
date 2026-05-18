import express from 'express';
import {
  getAllRoles, getRoleById, createRole,
  updateRole, updateRolePermission, deleteRole
} from '../controller/roleController.js';
import authMiddleware from '../../midllewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware(['admin']));

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Liste de tous les rôles
 *     tags:
 *       - Rôles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des rôles
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', getAllRoles);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Récupérer un rôle par son ID
 *     tags:
 *       - Rôles
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
 *         description: Rôle trouvé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Rôle non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', getRoleById);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Créer un rôle
 *     tags:
 *       - Rôles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Rôle créé
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post('/', createRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Modifier un rôle
 *     tags:
 *       - Rôles
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rôle mis à jour
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Rôle non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', updateRole);

/**
 * @swagger
 * /api/roles/{id}/permission:
 *   patch:
 *     summary: Modifier les permissions d'un rôle
 *     tags:
 *       - Rôles
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
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Permissions mises à jour
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Rôle non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/permission', updateRolePermission);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Supprimer un rôle
 *     tags:
 *       - Rôles
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
 *         description: Rôle supprimé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Rôle non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', deleteRole);

export default router;
