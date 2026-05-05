
import Department from "../model/Departments.js";
import User from "../model/User.js";

const VALID_STATUSES = ["active", "inactive"];

export const createDepartment = async (req, res) => {
    try {
        const { name, status = "active" } = req.body;

        if (!name) {
            return res.status(400).json({ message: "name is required" });
        }

        // Alignement frontend : status ne peut être que 'active' ou 'inactive'
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: "status must be 'active' or 'inactive'" });
        }

        // Alignement frontend : vérification des doublons (même logique que le store)
        const existing = await Department.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
        if (existing) {
            return res.status(400).json({ message: "Department already exists" });
        }

        const department = await Department.create({ name, status });
        res.status(201).json({ data: department });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllDepartments = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip  = (page - 1) * limit;

        // Alignement frontend : possibilité de filtrer par status
        const { status } = req.query;
        const filter = {};
        if (status && VALID_STATUSES.includes(status)) filter.status = status;

        // FIX : countDocuments et find exécutés en parallèle avec le même filter
        const [departments, total] = await Promise.all([
            Department.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
            Department.countDocuments(filter)
        ]);

        res.status(200).json({
            data: departments,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDepartmentById = async (req, res) => {
    const { id } = req.params;
    try {
        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }

        res.status(200).json({ data: department });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        const updates = { ...req.body };

        // Alignement frontend : valider le status si fourni
        if (updates.status && !VALID_STATUSES.includes(updates.status)) {
            return res.status(400).json({ message: "status must be 'active' or 'inactive'" });
        }

        const department = await Department.findByIdAndUpdate(id, updates, { new: true });

        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }

        res.status(200).json({ data: department });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({ message: "Department not found" });
        }

        // Alignement frontend : bloquer la suppression si des employés sont rattachés
        const employeeCount = await User.countDocuments({ department: department.name });
        if (employeeCount > 0) {
            return res.status(400).json({
                message: `Cannot delete department: ${employeeCount} employee(s) attached`
            });
        }

        await Department.findByIdAndDelete(id);
        res.status(200).json({ data: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// FIX : "rest" → "res" dans le bloc catch (ReferenceError au runtime)
// Note : cet endpoint est désormais couvert par getAllDepartments?status=active
// Conservé pour compatibilité
export const departmentActive = async (req, res) => {
    try {
        const departments = await Department.find({ status: "active" });
        res.status(200).json({ data: departments });
    } catch (error) {
        res.status(500).json({ message: error.message }); // FIX : rest → res
    }
};