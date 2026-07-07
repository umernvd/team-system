exports.validateCreate = (req) => {
    const errors = [];
    const data = req.body;
    if (Array.isArray(data)) {
        data.forEach((emp, i) => {
            if (!emp.name || !emp.role || !emp.department) {
                errors.push(`Employee at index ${i} must have name, role, and department`);
            }
        });
        return errors;
    }
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
        errors.push('Name is required');
    }
    if (!data.role || typeof data.role !== 'string' || !data.role.trim()) {
        errors.push('Role is required');
    }
    if (!data.department || typeof data.department !== 'string' || !data.department.trim()) {
        errors.push('Department is required');
    }
    return errors;
};

exports.validateUpdate = (req) => {
    const errors = [];
    if (!req.params.id) {
        errors.push('Employee ID is required');
    }
    if (!req.body || Object.keys(req.body).length === 0) {
        errors.push('At least one field to update is required');
    }
    return errors;
};

exports.validateDelete = (req) => {
    const errors = [];
    if (!req.params.id) {
        errors.push('Employee ID is required');
    }
    return errors;
};

exports.validateList = () => [];
