
export const isTokenValid = (token) => {
  if (!token) return false;

  try {

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < currentTime) {
      console.log('Token is expired');
      return false;
    }

    return true;
  } catch (error) {
    console.log('Token validation error:', error);
    return false;
  }
};

export const clearExpiredToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
