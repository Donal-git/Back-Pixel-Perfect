import express from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser
} from '../controller/userController.js';
import authMiddleware from '../../midllewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags:
 *       - Utilisateurs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne le token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Identifiants invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/login', loginUser);


/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Créer un utilisateur (admin)
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - department
 *               - poste
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Dona Donald"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "don@example.com"
 *               phone:
 *                 type: string
 *                 example: "+221 77 000 00 00"
 *               password:
 *                 type: string
 *                 format: password
 *               department:
 *                 type: string
 *                 example: "Comptabilité"
 *               poste:
 *                 type: string
 *                 example: "Directeur"
 *               role:
 *                 type: string
 *                 enum: [admin, grh, employee]
 *                 default: employee
 *               status:
 *                 type: string
 *                 enum: [actif, inactif]
 *                 default: actif
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Liste de tous les utilisateurs
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authMiddleware(['admin', 'grh']), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par son ID
 *     tags:
 *       - Utilisateurs
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
 *         description: Utilisateur trouvé
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authMiddleware(), getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Modifier un utilisateur
 *     tags:
 *       - Utilisateurs
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
 *               username:
 *                 type: string
 *               phone:
 *                 type: string
 *               department:
 *                 type: string
 *               poste:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, grh, employee]
 *               status:
 *                 type: string
 *                 enum: [actif, inactif]
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id', authMiddleware(['admin']), updateUser);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Activer / désactiver un utilisateur
 *     tags:
 *       - Utilisateurs
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
 *         description: Statut mis à jour
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.patch('/:id/status', authMiddleware(['admin']), toggleUserStatus);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags:
 *       - Utilisateurs
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
 *         description: Utilisateur supprimé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authMiddleware(['admin']), deleteUser);


router.get('/test', (req, res) => {
  res.json({ ok: true });
});
export default router;
