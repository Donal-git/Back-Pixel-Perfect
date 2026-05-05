/**
 * @swagger
 * components:
 *   schemas:
 *
 *     User:
 *       type: object
 *       description: Modèle complet (création)
 *       required:
 *         - username
 *         - email
 *         - phone
 *         - password
 *         - department
 *         - poste
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           example: Jean Kaboré
 *         email:
 *           type: string
 *           format: email
 *           example: jean.kabore@entreprise.com
 *         phone:
 *           type: string
 *           example: "+226 70 00 00 01"
 *         password:
 *           type: string
 *           format: password
 *           example: "MonMotDePasse@123"
 *         department:
 *           type: string
 *           example: IT
 *         poste:
 *           type: string
 *           example: Développeur Senior
 *         role:
 *           type: string
 *           enum: [admin, grh, employee]
 *           example: employee
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *           example: active
 *
 *     UserResponse:
 *       type: object
 *       description: Utilisateur retourné par l'API (sans mot de passe)
 *       properties:
 *         _id:
 *           type: string
 *           example: 64a7f9c2b3e4d5f6a7b8c9d0
 *         username:
 *           type: string
 *           example: Jean Kaboré
 *         email:
 *           type: string
 *           format: email
 *           example: jean.kabore@entreprise.com
 *         phone:
 *           type: string
 *           example: "+226 70 00 00 01"
 *         department:
 *           type: string
 *           example: IT
 *         poste:
 *           type: string
 *           example: Développeur Senior
 *         role:
 *           type: string
 *           enum: [admin, grh, employee]
 *           example: employee
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
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@test.com
 *         password:
 *           type: string
 *           format: password
 *           example: admin123
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT valable 24h
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         data:
 *           $ref: '#/components/schemas/UserResponse'
 */
