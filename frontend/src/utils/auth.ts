// Utility function to get the current user ID from localStorage
export const getCurrentUserId = (): number => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.userId || 1;
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
    }
  }
  return 1; // Default user ID for development
};

export const getCurrentUser = (): { userId: number; username: string; email: string } | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
    }
  }
  return null;
};

export const isLoggedIn = (): boolean => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!token && !!user;
};

