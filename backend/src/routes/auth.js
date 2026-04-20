const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const SALT_ROUNDS = 10;

function signToken(user) {
    return jwt.sign(
        { 
            email: user.email,
            org_id: user.organization_id 
        },
        process.env.JWT_SECRET,
        { subject: user.id, expiresIn: JWT_EXPIRES_IN }
    );
}

router.post('/register', async (req, res) => {
    const { name, email, password, avatarUrl, organizationName } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Email already in use' });
        }

        // 1. Create Organization
        const orgResult = await client.query(
            'INSERT INTO organizations (name) VALUES ($1) RETURNING id, name',
            [organizationName || `${name}'s Organization`]
        );
        const organization = orgResult.rows[0];

        // 2. Create User
        const userId = `usr_${randomUUID()}`;
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await client.query(
            `INSERT INTO users (id, name, email, password_hash, avatar_url, organization_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, email, avatar_url, organization_id`,
            [userId, name, email, passwordHash, avatarUrl || null, organization.id]
        );

        const user = result.rows[0];
        
        await client.query('COMMIT');
        
        const token = signToken(user);

        return res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatar_url,
                organizationId: user.organization_id,
                organizationName: organization.name
            },
            token
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.avatar_url, u.password_hash, u.organization_id, o.name as organization_name 
             FROM users u
             JOIN organizations o ON u.organization_id = o.id
             WHERE u.email = $1`,
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = signToken(user);

        return res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatar_url,
                organizationId: user.organization_id,
                organizationName: user.organization_name
            },
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.avatar_url, u.organization_id, o.name as organization_name 
             FROM users u
             JOIN organizations o ON u.organization_id = o.id
             WHERE u.id = $1`,
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json({
            id: result.rows[0].id,
            name: result.rows[0].name,
            email: result.rows[0].email,
            avatarUrl: result.rows[0].avatar_url,
            organizationId: result.rows[0].organization_id,
            organizationName: result.rows[0].organization_name
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
