/**
 * Role-Based Access Control Middleware
 * @param {Array<string>} allowedRoles - List of role names allowed to access the route
 */
function authorize(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRole = req.user.role;

        // If no roles specified, allow all authenticated users
        if (allowedRoles.length === 0) {
            return next();
        }

        if (allowedRoles.includes(userRole)) {
            return next();
        }

        return res.status(403).json({ 
            error: 'Access denied', 
            message: `Requires one of the following roles: \${allowedRoles.join(', ')}` 
        });
    };
}

module.exports = { authorize };
