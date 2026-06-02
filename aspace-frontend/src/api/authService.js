import apiClient from './apiClient';

export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });

    // Il backend risponde con { token, username, userId }
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);

      // Salviamo le info dell'utente (username e id) nel localStorage
      const userData = {
          id: response.data.userId || response.data.id,
          username: response.data.username
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Errore durante il login';
  }
};

export const register = async (username, email, password, firstName, lastName) => {
  try {
    const response = await apiClient.post('/auth/register', { username, email, password, firstName, lastName });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Errore durante la registrazione';
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('public_associations_cache');
  window.location.href = '/login';
  window.location.reload();
};