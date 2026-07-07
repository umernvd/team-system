function success(res, data, message = 'Success') {
    return res.json({ success: true, message, data });
}

function error(res, message, statusCode = 500, errors = []) {
    return res.status(statusCode).json({ success: false, message, errors });
}

module.exports = { success, error };
