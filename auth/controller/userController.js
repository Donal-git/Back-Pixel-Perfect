
import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const registerUser = async (req, res) => {
    const { username, email, phone, password, department, poste, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            phone,
            password: hashedPassword,
            department,
            poste,
            role
        });

        // FIX 1 : save() manquant — l'utilisateur n'était jamais enregistré en base
        await user.save();

        // FIX 2 : user.password = null avant save() écrasait le hash.
        // Bonne approche : construire la réponse sans le mot de passe.
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ data: true, user: userResponse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// FIX 3 : "rest" renommé en "res" — toutes les réponses échouaient avec ReferenceError
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // FIX 4 : "login" remplacé par "email" (variable inexistante)
        // FIX 5 : $or inutile avec un seul champ, requête simplifiée
        // .select('+password') nécessaire si le modèle a password: select: false
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Exclure le mot de passe de la réponse proprement
        const userResponse = user.toObject();
        delete userResponse.password;

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({ token, data: userResponse });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateUser = async (req, res) => {
    const { id } = req.params;
    try {
        const updates = { ...req.body };

        // FIX 6 : si le mot de passe est modifié, il doit être haché avant enregistrement
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const term = req.query.term || "";
        const { role, department, poste, phone, email, username } = req.query;
        const skip = (page - 1) * limit;

        // FIX 7 : filter déclaré AVANT d'être utilisé dans countDocuments
        const filter = {};

        if (term && term.trim() !== "") {
            const regex = { $regex: term, $options: "i" };
            filter.$or = [
                { username: regex },
                { email: regex },
                { department: regex },
                { poste: regex },
                { role: regex },
                { phone: regex }
            ];
        }
        if (role)       filter.role       = role;
        if (department) filter.department = department;
        if (poste)      filter.poste      = poste;
        if (phone)      filter.phone      = phone;
        if (email)      filter.email      = email;
        if (username)   filter.username   = username;

        // FIX 8 : countDocuments après la construction du filter, exécutés en parallèle
        const [users, total] = await Promise.all([
            User.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
            User.countDocuments(filter)
        ]);

        res.status(200).json({
            data: users,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};