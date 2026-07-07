exports.validateRefresh = (req) => {
    const errors = [];
    if (!req.body.refreshToken || typeof req.body.refreshToken !== 'string') {
        errors.push('Refresh token is required');
    }
    return errors;
};

exports.validateLogout = (req) => {
    const errors = [];
    if (!req.body.refreshToken || typeof req.body.refreshToken !== 'string') {
        errors.push('Refresh token is required');
    }
    return errors;
};
