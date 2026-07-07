exports.validateRegister = (req) => {
    const errors = [];
    const { username, password, role } = req.body;
    if (!username || typeof username !== 'string' || !username.trim()) {
        errors.push('Username is required');
    }
    if (!password || typeof password !== 'string') {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    if (role && !['user', 'admin'].includes(role)) {
        errors.push('Role must be user or admin');
    }
    return errors;
};

exports.validateLogin = (req) => {
    const errors = [];
    const { username, password } = req.body;
    if (!username || typeof username !== 'string' || !username.trim()) {
        errors.push('Username is required');
    }
    if (!password || typeof password !== 'string') {
        errors.push('Password is required');
    }
    return errors;
};
