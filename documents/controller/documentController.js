import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Document from '../model/Document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Dossier de stockage : <project_root>/uploads/
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── Upload d'un document ─────────────────────────────────────────────────────
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier reçu' });
    }

    const { userId, type } = req.body;
    if (!userId || !type) {
      // Supprimer le fichier déjà stocké si la requête est invalide
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'userId et type sont obligatoires' });
    }

    const doc = await Document.create({
      userId,
      name:       req.file.originalname,
      type,
      mimetype:   req.file.mimetype,
      filename:   req.file.filename,
      size:       req.file.size,
      uploadedBy: req.user.id
    });

    res.status(201).json({ data: doc.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Liste des documents d'un employé ────────────────────────────────────────
export const getDocumentsByUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId est obligatoire' });
    }

    const docs = await Document.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ data: docs.map(d => d.toJSON()) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Métadonnées d'un document ────────────────────────────────────────────────
export const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document non trouvé' });
    res.status(200).json({ data: doc.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Téléchargement d'un fichier ──────────────────────────────────────────────
export const downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document non trouvé' });

    const filePath = path.join(UPLOADS_DIR, doc.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier introuvable sur le serveur' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.name)}"`);
    res.setHeader('Content-Type', doc.mimetype);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Suppression d'un document ────────────────────────────────────────────────
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document non trouvé' });

    const filePath = path.join(UPLOADS_DIR, doc.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await doc.deleteOne();
    res.status(200).json({ data: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
