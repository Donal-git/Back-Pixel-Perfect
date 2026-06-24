import express from "express";
import {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    departmentActive
} from "../controller/departmentController.js";
import authMiddleware from "../../midllewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Créer un département
 *     tags:
 *       - Départements
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentInput'
 *     responses:
 *       201:
 *         description: Département créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       400:
 *         description: Données invalides ou département déjà existant
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post("/", authMiddleware(["admin"]), createDepartment);

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Liste des départements avec pagination
 *     tags:
 *       - Départements
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Liste des départements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Department'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get("/", authMiddleware(), getAllDepartments);

/**
 * @swagger
 * /api/departments/active:
 *   get:
 *     summary: Liste des départements actifs
 *     tags:
 *       - Départements
 *     responses:
 *       200:
 *         description: Départements actifs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Department'
 *       500:
 *         description: Erreur serveur
 */
router.get("/active", departmentActive);

/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     summary: Récupérer un département par son ID
 *     tags:
 *       - Départements
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
 *         description: Département trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Département non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get("/:id", authMiddleware(), getDepartmentById);

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Modifier un département
 *     tags:
 *       - Départements
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
 *             $ref: '#/components/schemas/DepartmentInput'
 *     responses:
 *       200:
 *         description: Département mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Department'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Département non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", authMiddleware(["admin"]), updateDepartment);

/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     summary: Supprimer un département
 *     tags:
 *       - Départements
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
 *         description: Département supprimé
 *       400:
 *         description: Impossible de supprimer (employés rattachés)
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Département non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", authMiddleware(["admin"]), deleteDepartment);

export default router;
