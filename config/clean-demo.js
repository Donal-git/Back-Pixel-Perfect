import mongoose from 'mongoose';
import 'dotenv/config.js';
import { cleanDemoData } from './seed.js';
import { connectDb } from './connectDb.js';

/**
 * Script utilitaire pour nettoyer les données de démonstration
 * Supprime uniquement les enregistrements marqués comme isDemoData: true
 * 
 * Utilisation:
 *   npm run clean-demo
 */

const cleanUp = async () => {
  try {
    console.log('🔗 Connexion à la base de données...');
    await connectDb();
    
    console.log('🧹 Suppression des données de démonstration...');
    await cleanDemoData();
    
    console.log('✅ Nettoyage terminé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

cleanUp();
