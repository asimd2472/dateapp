import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const BASE_URL = 'http://192.168.1.6:8002/api'; // 🔁 change this once

// ─── Core fetcher ────────────────────────────────────────────────

// const request = async (endpoint, options = {}, requiresAuth = false) => {
//   const headers = { 'Content-Type': 'application/json', ...options.headers };

//   if (requiresAuth) {
//     const token = await AsyncStorage.getItem('token');
//     if (token) headers['Authorization'] = `Bearer ${token}`;
//   }

//   const response = await fetch(`${BASE_URL}${endpoint}`, {
//     ...options,
//     headers,
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     // ✅ your API uses "msg" not "message"
//     throw { status: response.status, message: data?.msg || data?.message || 'Something went wrong' };
//   }

//   return data;
// };


const request = async (
  endpoint,
  options = {},
  requiresAuth = false
) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (requiresAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios({
      url: `${BASE_URL}${endpoint}`,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      headers,
      timeout: 10000,
    });

    console.log('AXIOS RESPONSE:', response.data);

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

// ─── Protected (sends token automatically) ───────────────────────
export const privateApi = {
  getProfile: () =>
    request('/user/profile', { method: 'GET' }, true),

  updateProfile: (data) =>
    request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),

  getNearbyUsers: (filters) =>
    request('/users/nearby', {
      method: 'POST',
      body: JSON.stringify(filters),
    }, true),

  likeUser: (userId) =>
    request(`/users/${userId}/like`, { method: 'POST' }, true),

  dislikeUser: (userId) =>
    request(`/users/${userId}/dislike`, { method: 'POST' }, true),
};