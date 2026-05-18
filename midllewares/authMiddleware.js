import jwt from 'jsonwebtoken';
import User from '../auth/model/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Usage: authMiddleware()            → auth only
//        authMiddleware(['admin'])   → admin only
//        authMiddleware(['admin', 'grh']) → admin or grh
const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: 'Accès refusé: token manquant', code: 'NO_TOKEN' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id || decoded._id);

      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé', code: 'USER_NOT_FOUND' });
      }

      // Frontend status values: 'actif' | 'inactif'
      if (user.status === 'inactif') {
        return res.status(403).json({ message: 'Compte désactivé', code: 'ACCOUNT_DISABLED' });
      }

      req.user = { _id: user._id, id: user._id, role: user.role };

      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Accès refusé: permissions insuffisantes', code: 'FORBIDDEN' });
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expirée, veuillez vous reconnecter', code: 'TOKEN_EXPIRED' });
      }
      return res.status(403).json({ message: 'Token invalide', code: 'INVALID_TOKEN' });
    }
  };
};

export default authMiddleware;
