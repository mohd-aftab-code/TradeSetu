// Cookie utility functions for managing user authentication data

export const setCookie = (name: string, value: string, days: number = 7): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  const cookieValue = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  document.cookie = cookieValue;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
};

export const removeCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Specific functions for user authentication
export const setUserToken = (token: string): void => {
  setCookie('userToken', token, 7); // 7 days expiry
};

export const getUserToken = (): string | null => {
  const token = getCookie('userToken');
  console.log('getUserToken - Retrieved token:', token);
  return token;
};

export const setUserData = (userData: any): void => {
  setCookie('userData', JSON.stringify(userData), 7); // 7 days expiry
};

export const getUserData = (): any => {
  const data = getCookie('userData');
  console.log('getUserData - Raw cookie data:', data);
  if (data) {
    try {
      const parsedData = JSON.parse(data);
      console.log('getUserData - Parsed data:', parsedData);
      return parsedData;
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
      return null;
    }
  }
  console.log('getUserData - No data found');
  return null;
};

export const removeUserAuth = (): void => {
  removeCookie('userToken');
  removeCookie('userData');
};

// For selected plan (if needed)
export const setSelectedPlan = (plan: string): void => {
  setCookie('selectedPlan', plan, 1); // 1 day expiry
};

export const getSelectedPlan = (): string | null => {
  return getCookie('selectedPlan');
};

export const removeSelectedPlan = (): void => {
  removeCookie('selectedPlan');
};
