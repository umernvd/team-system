const BASE = '/api';

export async function getEmployees(token) {
  try {
    const res = await fetch(`${BASE}/employees`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('getEmployees response:', data);
    return data;
  } catch (err) {
    console.error('getEmployees error:', err);
    return { success: false, message: err.message };
  }
}

export async function createEmployee(token, body) {
  try {
    const res = await fetch(`${BASE}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log('createEmployee response:', data);
    return data;
  } catch (err) {
    console.error('createEmployee error:', err);
    return { success: false, message: err.message };
  }
}

export async function updateEmployee(token, id, body) {
  try {
    const res = await fetch(`${BASE}/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('updateEmployee error:', err);
    return { success: false, message: err.message };
  }
}

export async function deleteEmployee(token, id) {
  try {
    const res = await fetch(`${BASE}/employees/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('deleteEmployee error:', err);
    return { success: false, message: err.message };
  }
}
