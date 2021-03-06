const jwt = require('jsonwebtoken')


const authentication = function (req, res, next) {
    try {
        const token = req.header('Authorization', 'Bearer Token')
        if (!token) {
            return res.status(403).send({ status: false, message: `Missing authentication token in request` })
        }
        let splitToken = token.split(' ')

        let decodeToken = jwt.decode(splitToken[1], 'Project6-Products_management')
        if (!decodeToken) {
            return res.status(403).send({ status: false, message: `Invalid authentication token in request ` })
        }
        if (Date.now() > (decodeToken.exp) * 1000) {
            return res.status(404).send({ status: false, message: `Session Expired, please login again` })
        }
        req.userId = decodeToken.userId
        next()
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { authentication }