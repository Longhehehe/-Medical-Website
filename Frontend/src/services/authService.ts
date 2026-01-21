import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

interface SignupData {
  userName: string;
  passWord: string;
  email: string;
  DoB?: string;
  phoneNum: string;
  fullName: string;
  address?: string;
}

interface LoginData {
  email: string;
  passWord: string;
}

interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileUpdateData {
  fullName?: string;
  phoneNum?: string;
  address?: string;
  DoB?: string | null;
  sex?: boolean;
}

interface PasswordUpdateData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordPublicData {
  email: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authService = {
  // Đăng ký tài khoản
  signup: async (data: SignupData) => {
    return await axios.post(`${API_URL}/register`, data);
  },

  // Đăng nhập
  login: async (data: LoginData) => {
    return await axios.post(`${API_URL}/login`, data);
  },

  // Yêu cầu OTP để reset password
  forgotPassword: async (email: string) => {
    return await axios.post(`${API_URL}/forgot-password`, { email });
  },

  // Reset password với OTP
  resetPassword: async (data: ResetPasswordData) => {
    return await axios.post(`${API_URL}/reset-password`, data);
  },

  // Get current user profile
  getProfile: async () => {
    return await axios.get(`${API_URL}/profile`, { headers: getAuthHeader() });
  },

  // Update current user profile
  updateProfile: async (data: ProfileUpdateData) => {
    return await axios.put(`${API_URL}/profile`, data, { headers: getAuthHeader() });
  },

  // Update password (Change password - requires auth)
  updatePassword: async (data: PasswordUpdateData) => {
    return await axios.put(`${API_URL}/update-password`, data, { headers: getAuthHeader() });
  },

  // Change password without auth (pre-login)
  changePasswordPublic: async (data: ChangePasswordPublicData) => {
    return await axios.put(`${API_URL}/change-password-public`, data);
  },
};

