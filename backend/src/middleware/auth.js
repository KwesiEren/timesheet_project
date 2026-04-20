const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: payload.sub,
            email: payload.email,
            organizationId: payload.org_id
        };
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = { authenticateToken };
