/**
 * @swagger
 * components:
 *   schemas:
 *
 *     DepartmentInput:
 *       type: object
 *       description: Données pour créer ou modifier un département
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Ressources Humaines
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *           example: active
 *
 *     Department:
 *       type: object
 *       description: Département retourné par l'API
 *       properties:
 *         _id:
 *           type: string
 *           example: 64a7f9c2b3e4d5f6a7b8c9d0
 *         name:
 *           type: string
 *           example: Ressources Humaines
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           example: active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T08:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T08:30:00.000Z"
 */
