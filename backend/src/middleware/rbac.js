const { adminClient } = require('../lib/supabase');

/**
 * Role-Based Access Control Middleware for Supabase
 * @param {Array<string>} roles - List of allowed roles (e.g., ['owner', 'manager'])
 */
function requireOrgRole(roles = ['owner', 'manager']) {
    return async (req, res, next) => {
        if (!req.orgId) {
            return res.status(400).json({ error: 'missing_org', message: 'X-Organization-Id header is required' });
        }

        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ error: 'unauthorized', message: 'Authentication required' });
        }

        try {
            const { data, error } = await adminClient
                .from('user_roles')
                .select('role')
                .eq('user_id', req.auth.userId)
                .eq('organization_id', req.orgId)
                .maybeSingle();

            if (error) {
                console.error('RBAC Check Error:', error.message);
                return res.status(500).json({ error: 'internal_error', message: error.message });
            }

            if (!data || !roles.includes(data.role)) {
                return res.status(403).json({ 
                    error: 'forbidden', 
                    message: `Requires one of the following roles: \${roles.join(', ')}` 
                });
            }

            req.userRole = data.role;
            // Support for older routes
            req.user.role = data.role;
            
            next();
        } catch (err) {
            console.error('RBAC Runtime Error:', err.message);
            return res.status(500).json({ error: 'internal_error', message: 'Failed to verify user permissions' });
        }
    };
}

module.exports = { requireOrgRole, authorize: requireOrgRole };
