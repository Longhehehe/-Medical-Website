import React, { useState, type ChangeEvent, type FormEvent } from "react";
import styles from "./ChangePass.module.css";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router";

interface FieldErrors {
  email?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Xóa lỗi khi người dùng bắt đầu nhập lại
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi cho field đang nhập
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    if (generalError) setGeneralError(null);
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    const { email, oldPassword, newPassword, confirmPassword } = formData;

    // Email validation
    if (!email.trim()) {
      errors.email = "Email là bắt buộc";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = "Email không hợp lệ";
      }
    }

    // Old password validation
    if (!oldPassword) {
      errors.oldPassword = "Mật khẩu cũ là bắt buộc";
    }

    // New password validation
    if (!newPassword) {
      errors.newPassword = "Mật khẩu mới là bắt buộc";
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        errors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số";
      } else if (newPassword === oldPassword) {
        errors.newPassword = "Mật khẩu mới không được trùng với mật khẩu cũ";
      }
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
    } else if (newPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp với mật khẩu mới";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccess(null);

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await authService.changePasswordPublic({
        email: formData.email.trim(),
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setSuccess("Đổi mật khẩu thành công! Bạn sẽ được chuyển đến trang đăng nhập sau 2 giây.");
      setFormData({
        email: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/Login");
      }, 2000);

    } catch (err: any) {
      const response = err.response?.data;

      // Handle field-specific errors from backend
      if (response?.field) {
        setFieldErrors((prev) => ({
          ...prev,
          [response.field]: response.message,
        }));
      } else {
        setGeneralError(response?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <img src="/images/logo.png" alt="" />
        <h2 className={styles.title}>Đổi Mật Khẩu</h2>
        <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Nhập email và mật khẩu cũ để xác minh tài khoản
        </p>

        {generalError && <div className={styles.errorMessage}>{generalError}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
              placeholder="example@email.com"
            />
            {fieldErrors.email && (
              <span className={styles.fieldError}>{fieldErrors.email}</span>
            )}
          </div>

          {/* Mật khẩu cũ */}
          <div className={styles.inputGroup}>
            <label htmlFor="oldPassword" className={styles.label}>
              Mật khẩu cũ
            </label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.oldPassword ? styles.inputError : ''}`}
              placeholder="••••••••"
            />
            {fieldErrors.oldPassword && (
              <span className={styles.fieldError}>{fieldErrors.oldPassword}</span>
            )}
          </div>

          {/* Mật khẩu mới */}
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword" className={styles.label}>
              Mật khẩu mới
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.newPassword ? styles.inputError : ''}`}
              placeholder="••••••••"
            />
            {fieldErrors.newPassword && (
              <span className={styles.fieldError}>{fieldErrors.newPassword}</span>
            )}
            <small style={{ color: '#888', fontSize: '0.75rem' }}>
              Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số
            </small>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.confirmPassword ? styles.inputError : ''}`}
              placeholder="••••••••"
            />
            {fieldErrors.confirmPassword && (
              <span className={styles.fieldError}>{fieldErrors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <a href="/Login" style={{ color: '#1abc9c', textDecoration: 'none' }}>
              ← Quay lại đăng nhập
            </a>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ChangePassword;
