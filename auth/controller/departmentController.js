import Department from '../model/Departments.js';
import User from '../model/User.js';

const VALID_STATUSES = ['active', 'inactive'];

// Helper: attach live employeeCount to a department document
const withEmployeeCount = async (dept) => {
  const employeeCount = await User.countDocuments({ department: dept.name });
  const obj = dept.toObject ? dept.toObject() : { ...dept };
  obj.id = obj._id?.toString() || obj.id;
  delete obj._id;
  delete obj.__v;
  return { ...obj, employeeCount };
};

export const createDepartment = async (req, res) => {
  try {
    const { name, status = 'active' } = req.body;

    if (!name) return res.status(400).json({ message: 'Le nom est requis' });
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "status doit être 'active' ou 'inactive'" });
    }

    const existing = await Department.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) return res.status(400).json({ message: 'Ce département existe déjà' });

    const dept = await Department.create({ name, status });
    res.status(201).json({ data: await withEmployeeCount(dept) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDepartments = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip  = (page - 1) * limit;
    const { status } = req.query;

    const filter = {};
    if (status && VALID_STATUSES.includes(status)) filter.status = status;

    const [depts, total] = await Promise.all([
      Department.find(filter).skip(skip).limit(limit).sort({ name: 1 }),
      Department.countDocuments(filter)
    ]);

    const data = await Promise.all(depts.map(withEmployeeCount));

    res.status(200).json({
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Département non trouvé' });
    res.status(200).json({ data: await withEmployeeCount(dept) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.status && !VALID_STATUSES.includes(updates.status)) {
      return res.status(400).json({ message: "status doit être 'active' ou 'inactive'" });
    }

    const dept = await Department.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!dept) return res.status(404).json({ message: 'Département non trouvé' });
    res.status(200).json({ data: await withEmployeeCount(dept) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Département non trouvé' });

    const employeeCount = await User.countDocuments({ department: dept.name });
    if (employeeCount > 0) {
      return res.status(400).json({
        message: `Impossible de supprimer: ${employeeCount} employé(s) rattaché(s)`
      });
    }

    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ data: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const departmentActive = async (req, res) => {
  try {
    const depts = await Department.find({ status: 'active' }).sort({ name: 1 });
    const data = await Promise.all(depts.map(withEmployeeCount));
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
