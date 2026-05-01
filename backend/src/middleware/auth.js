const jwt = require('jsonwebtoken');

/**
 * Middleware to verify Supabase JWT
 */
function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'missing_token', message: 'Authentication token is required' });
    }

    try {
        const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET, {
            algorithms: ['HS256'],
        });

        req.auth = {
            token,
            userId: payload.sub,           // auth.users.id
            email: payload.email,
            role: payload.role,            // Supabase role: "authenticated"
        };

        // Standardized organization ID from header
        req.orgId = req.headers['x-organization-id'] || null;
        
        // For compatibility with older routes during migration
        req.user = {
            id: payload.sub,
            email: payload.email,
            organizationId: req.orgId,
            role: payload.role
        };

        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        return res.status(401).json({ error: 'invalid_token', message: 'Token is invalid or expired' });
    }
}

module.exports = { requireAuth, authenticateToken: requireAuth };
