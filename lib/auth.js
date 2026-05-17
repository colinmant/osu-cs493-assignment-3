const jwt = require('jsonwebtoken')

const secretKey = process.env.JWT_SECRET

function generateAuthToken(userId) {
    const payload = { "sub": userId }
    const expiration = { "expiresIn": '24h'}

    return jwt.sign(payload, secretKey, expiration)
}

function requireAuth(req, res, next) {
    const authHeader = req.get('Authorization') || ''
    const authHeaderParts = authHeader.split(' ')
    if (authHeaderParts[0] != 'Bearer') {
        return res.status(401).json({ error: "Invaid token" })
    }
    try {
        const payload = jwt.verify(authHeaderParts[1], secretKey)
        res.locals.user = payload.sub
        next()
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' })
    }
}

module.exports = { generateAuthToken, requireAuth }

