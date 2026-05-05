
import jwt from "jsonwebtoken";
import User from "../auth/model/User.js"; // FIX : chemin aligné avec le reste du projet
import dotenv from "dotenv";

dotenv.config();

// FIX : factory enrichie avec un paramètre "roles" optionnel
// Usage : authMiddleware()            → authentification seule
//         authMiddleware(['admin'])   → admin uniquement
//         authMiddleware(['admin', 'grh']) → admin ou grh
const authMiddleware = (roles = []) => {
    return async (req, res, next) => {

        // FIX : req.headers est un objet (pas une fonction)
        // Express normalise les noms de headers en minuscules
        const authHeader = req.headers['authorization'];

        // FIX : extraction robuste avec split
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null;

        if (!token) {
            return res.status(401).json({
                message: 'Accès refusé: token manquant',
                code: 'NO_TOKEN'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id || decoded._id);

            if (!user) {
                return res.status(401).json({
                    message: 'Utilisateur non trouvé',
                    code: 'USER_NOT_FOUND'
                });
            }

            if (user.status === 'inactive') {
                return res.status(403).json({
                    message: 'Compte désactivé',
                    code: 'ACCOUNT_DISABLED'
                });
            }

            req.user = {
                _id: user._id,
                id:  user._id,
                role: user.role
            };

            // Contrôle des rôles si des restrictions sont définies
            if (roles.length > 0 && !roles.includes(user.role)) {
                return res.status(403).json({
                    message: 'Accès refusé: permissions insuffisantes',
                    code: 'FORBIDDEN'
                });
            }

            next();

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: 'Session expirée, veuillez vous reconnecter',
                    code: 'TOKEN_EXPIRED' // FIX : était 'INVALID_TOKEN', codes distincts maintenant
                });
            }
            return res.status(403).json({
                message: 'Token invalide',
                code: 'INVALID_TOKEN'
                // FIX : error.message supprimé — ne pas exposer les détails internes
            });
        }
    };
};

export default authMiddleware;