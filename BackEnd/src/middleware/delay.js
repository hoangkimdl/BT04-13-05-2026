const delay = (req, res, next) => {
    const isReadOnly = req.method === 'GET' || req.method === 'HEAD';
    const waitMs = isReadOnly ? 0 : 300;

    setTimeout(() => {
        next();
    }, waitMs);
};

module.exports = delay;