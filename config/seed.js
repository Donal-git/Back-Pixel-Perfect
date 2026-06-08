import bcrypt from 'bcryptjs';
import 'dotenv/config.js';
import User from '../auth/model/User.js';
import Department from '../auth/model/Departments.js';
import Role from '../appConfig/model/Role.js';
import AppConfig from '../appConfig/model/AppConfig.js';
import Survey from '../surveys/model/Survey.js';
import Formation from '../formation/model/Formation.js';

// ─── Departments ─────────────────────────────────────────────────────────────
const DEFAULT_DEPARTMENTS = [
  'Direction', 'RH', 'Finance', 'IT',
  'Commercial', 'Production', 'Marketing', 'Logistique'
];

// ─── Default roles (matches frontend appConfig store) ────────────────────────
const DEFAULT_ROLES = [
  {
    name: 'Admin',
    description: 'Accès complet à toutes les fonctionnalités du système',
    permissions: {
      survey_create: true, survey_edit: true, survey_delete: true, survey_view_all: true,
      personnel_create: true, personnel_edit: true, personnel_delete: true, personnel_view_all: true,
      formation_create: true, formation_edit: true, formation_delete: true, formation_view_all: true,
      reports_view: true, settings_edit: true, roles_edit: true, departments_edit: true
    }
  },
  {
    name: 'GRH',
    description: 'Gestion complète des ressources humaines',
    permissions: {
      survey_create: true, survey_edit: true, survey_delete: false, survey_view_all: true,
      personnel_create: false, personnel_edit: false, personnel_delete: false, personnel_view_all: true,
      formation_create: true, formation_edit: true, formation_delete: false, formation_view_all: true,
      reports_view: true, settings_edit: false, roles_edit: false, departments_edit: false
    }
  },
  {
    name: 'Employé',
    description: 'Accès standard pour consultation et demandes personnelles',
    permissions: {
      survey_create: false, survey_edit: false, survey_delete: false, survey_view_all: false,
      personnel_create: false, personnel_edit: false, personnel_delete: false, personnel_view_all: false,
      formation_create: false, formation_edit: false, formation_delete: false, formation_view_all: true,
      reports_view: false, settings_edit: false, roles_edit: false, departments_edit: false
    }
  }
];

// ─── Test accounts (matches frontend fakeUsers) ───────────────────────────────
const TEST_USERS = [
  { name: 'Admin Principal',   email: 'admin@test.com',    password: 'admin123',    role: 'admin',    department: 'Direction', position: 'Administrateur Système', isDemoData: true },
  { name: 'Responsable GRH',  email: 'grh@test.com',      password: 'grh123',      role: 'grh',      department: 'RH',        position: 'Responsable RH', isDemoData: true },
  { name: 'Employé Standard', email: 'employee@test.com', password: 'employee123', role: 'employee', department: 'IT',        position: 'Employé', isDemoData: true }
];

// ─── Demo surveys ─────────────────────────────────────────────────────────────
const DEMO_SURVEYS = [
  {
    title: 'Satisfaction des employés Q1 2024',
    description: "Évaluation trimestrielle de la satisfaction au travail",
    isAnonymous: true,
    status: 'active',
    questions: [
      { id: 'q1', question_text: 'Comment évaluez-vous votre satisfaction globale ?', question_type: 'likert', options: [], is_required: true }
    ],
    sent_to: ['RH', 'Finance', 'IT'],
    isDemoData: true
  },
  {
    title: 'Évaluation annuelle des compétences',
    description: "Bilan des compétences techniques et soft skills",
    isAnonymous: false,
    status: 'draft',
    questions: [],
    sent_to: [],
    isDemoData: true
  }
];

// ─── Demo formations ──────────────────────────────────────────────────────────
const DEMO_FORMATIONS = [
  {
    title: 'Excel Avancé',
    description: "Maîtrisez les fonctions avancées d'Excel.",
    category: 'Informatique',
    duration: '2 jours',
    level: 'avancé',
    status: 'disponible',
    departments: ['Finance', 'RH'],
    participants: 32,
    isDemoData: true
  },
  {
    title: "Management d'équipe",
    description: "Techniques de management et leadership.",
    category: 'Management',
    duration: '3 jours',
    level: 'intermédiaire',
    status: 'en_cours',
    departments: ['Tous les départements'],
    participants: 25,
    isDemoData: true
  },
  {
    title: 'Communication professionnelle',
    description: "Améliorer la communication interne et externe.",
    category: 'Soft Skills',
    duration: '1 jour',
    level: 'débutant',
    status: 'disponible',
    departments: ['Commercial', 'RH', 'Direction'],
    participants: 18,
    isDemoData: true
  },
  {
    title: 'Gestion de projet Agile',
    description: "Méthodologies Scrum et Kanban.",
    category: 'Management',
    duration: '4 jours',
    level: 'intermédiaire',
    status: 'disponible',
    departments: ['IT', 'Commercial'],
    participants: 15,
    isDemoData: true
  }
];

// ─── Main seed function ───────────────────────────────────────────────────────
const seed = async () => {
  // Vérifier si le seeding est activé
  const shouldSeed = process.env.SEED_DATABASE !== 'false';
  
  if (!shouldSeed) {
    console.log('⏭️  Seeding désactivé (SEED_DATABASE=false)');
    return;
  }

  try {
    // Departments
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      await Department.insertMany(
        DEFAULT_DEPARTMENTS.map(name => ({ name, status: 'active' }))
      );
      console.log('✅ Départements initialisés');
    }

    // Roles
    const roleCount = await Role.countDocuments();
    if (roleCount === 0) {
      await Role.insertMany(DEFAULT_ROLES);
      console.log('✅ Rôles initialisés');
    }

    // App config (singleton)
    const configCount = await AppConfig.countDocuments();
    if (configCount === 0) {
      await AppConfig.create({});
      console.log('✅ Configuration initialisée');
    }

    // Test users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      for (const u of TEST_USERS) {
        const hashed = await bcrypt.hash(u.password, 10);
        await User.create({ ...u, password: hashed, status: 'actif', isDemoData: true });
      }
      console.log('✅ Comptes de test initialisés (marqués comme démo)');
    }

    // Demo surveys
    const surveyCount = await Survey.countDocuments();
    if (surveyCount === 0) {
      await Survey.insertMany(DEMO_SURVEYS);
      console.log('✅ Sondages de démonstration initialisés (marqués comme démo)');
    }

    // Demo formations
    const formationCount = await Formation.countDocuments();
    if (formationCount === 0) {
      await Formation.insertMany(DEMO_FORMATIONS);
      console.log('✅ Formations de démonstration initialisées (marquées comme démo)');
    }

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error.message);
  }
};

// ─── Clean demo data function ──────────────────────────────────────────────────
const cleanDemoData = async () => {
  try {
    const userResult = await User.deleteMany({ isDemoData: true });
    const surveyResult = await Survey.deleteMany({ isDemoData: true });
    const formationResult = await Formation.deleteMany({ isDemoData: true });

    console.log(`\n🧹 Nettoyage des données de démo complété :`);
    console.log(`   - ${userResult.deletedCount} utilisateurs supprimés`);
    console.log(`   - ${surveyResult.deletedCount} sondages supprimés`);
    console.log(`   - ${formationResult.deletedCount} formations supprimées\n`);
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  }
};

export { seed, cleanDemoData };
export default seed;
