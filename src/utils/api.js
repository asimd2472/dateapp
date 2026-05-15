import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://www.videosavezone.com/public/dateapp-laravel/public/api'; 

const request = async (
  endpoint,
  options = {},
  requiresAuth = false
) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const isFormData = options.body instanceof FormData;

    const headers = {
      Accept: 'application/json',
      ...(isFormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    if (requiresAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios({
      url: `${BASE_URL}${endpoint}`,
      method: options.method || 'GET',
      data: options.body || undefined,
      headers,
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    console.log(
      'AXIOS ERROR:',
      error?.response?.data || error.message
    );

    throw {
      message:
        error?.response?.data?.msg ||
        error.message ||
        'Something went wrong',
    };
  }
};

// ─── Public (no auth needed) ─────────────────────────────────────
export const publicApi = {
  sendEmailOTP: (email) =>
    request('/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOTP: (email, otp) =>
    request('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getCities: () =>
    request('/get-city', {
      method: 'GET',
      body: JSON.stringify({ }),
    }),
};


export const privateApi = {
  updateProfile: (formData) =>
  request(
    '/register-update-profile',
    {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
    true
  ),

  updateInterests: (formData) =>
  request(
    '/Interests-update',
    {
      method: 'POST',
      body: formData,
    },
    true
  ),

  getProfiles: () => request('/profiles', { method: 'GET' }, true),

  likeUser: (userId) =>
    request(`/users/like/${userId}`, { method: 'POST' }, true),

  dislikeUser: (userId) =>
    request(`/users/dislike/${userId}`, { method: 'POST' }, true),
};