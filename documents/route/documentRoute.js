import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import authMiddleware from '../../midllewares/authMiddleware.js';
import {
  uploadDocument,
  getDocumentsByUser,
  getDocumentById,
  downloadDocument,
  deleteDocument
} from '../controller/documentController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});

const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo max
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Formats acceptés : PDF, JPG, PNG, WEBP, DOC, DOCX'));
    }
  }
});

const router = express.Router();

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Uploader un document pour un employé
 *     tags:
 *       - Documents
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - userId
 *               - type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               userId:
 *                 type: string
 *                 description: ID de l'employé propriétaire du document
 *               type:
 *                 type: string
 *                 enum: [contrat, diplome, attestation, bulletin_salaire, piece_identite, autre]
 *     responses:
 *       201:
 *         description: Document uploadé avec succès
 *       400:
 *         description: Fichier manquant ou paramètres invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.post(
  '/',
  authMiddleware(['admin', 'grh']),
  upload.single('file'),
  uploadDocument
);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Liste des documents d'un employé
 *     tags:
 *       - Documents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'employé
 *     responses:
 *       200:
 *         description: Liste des documents
 *       400:
 *         description: userId manquant
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/', authMiddleware(), getDocumentsByUser);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Métadonnées d'un document
 *     tags:
 *       - Documents
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
 *         description: Métadonnées du document
 *       404:
 *         description: Document non trouvé
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', authMiddleware(), getDocumentById);

/**
 * @swagger
 * /api/documents/{id}/download:
 *   get:
 *     summary: Télécharger un fichier
 *     tags:
 *       - Documents
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
 *         description: Fichier binaire
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Document ou fichier non trouvé
 *       401:
 *         description: Non authentifié
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id/download', authMiddleware(), downloadDocument);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Supprimer un document
 *     tags:
 *       - Documents
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
 *         description: Document supprimé
 *       404:
 *         description: Document non trouvé
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/:id', authMiddleware(['admin', 'grh']), deleteDocument);

export default router;
