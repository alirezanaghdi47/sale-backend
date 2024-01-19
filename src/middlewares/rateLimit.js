// libraries
const {rateLimit} = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    headers: true,
    keyGenerator: (req, res) => req.ip,
});

module.exports = limiter;