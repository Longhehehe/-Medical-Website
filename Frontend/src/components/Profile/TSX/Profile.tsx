import { useState, useEffect } from "react";
import styles from "../CSS/Profile.module.css";
import { authService } from "../../../services/authService";
import { useAuth } from "../../../contexts/AuthContext";

interface UserProfile {
    id: string;
    userName: string;
    fullName: string;
    email: string;
    phoneNum: string;
    address: string;
    DoB: string;
    sex: boolean | null;
    role: string;
}

export const Profile = () => {
    const { updateUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Edit form state
    const [editForm, setEditForm] = useState({
        fullName: "",
        phoneNum: "",
        address: "",
        DoB: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await authService.getProfile();
            const user = response.data.user;
            setProfile(user);
            setEditForm({
                fullName: user.fullName || "",
                phoneNum: user.phoneNum || "",
                address: user.address || "",
                DoB: user.DoB ? new Date(user.DoB).toISOString().split('T')[0] : "",
            });
        } catch (err: any) {
            setError(err.response?.data?.message || "Lỗi tải thông tin");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editForm.fullName.trim()) {
            setError("Họ tên không được để trống");
            return;
        }

        try {
            setSaving(true);
            setError(null);

            // Clean data before sending
            const updateData = {
                ...editForm,
                DoB: editForm.DoB === "" ? null : editForm.DoB
            };

            const response = await authService.updateProfile(updateData);
            setProfile(prev => prev ? { ...prev, ...response.data.user } : null);

            // Update AuthContext so Header displays updated name immediately
            updateUser({
                fullName: response.data.user.fullName,
                phoneNum: response.data.user.phoneNum
            });

            setSuccess("Cập nhật thành công!");
            setIsEditing(false);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Lỗi cập nhật");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError(null);
        // Reset form to current profile values
        if (profile) {
            setEditForm({
                fullName: profile.fullName || "",
                phoneNum: profile.phoneNum || "",
                address: profile.address || "",
                DoB: profile.DoB ? new Date(profile.DoB).toISOString().split('T')[0] : "",
            });
        }
    };

    if (loading) {
        return <div className={styles.loading}>Đang tải...</div>;
    }

    if (!profile) {
        return <div className={styles.error}>Không tìm thấy thông tin người dùng</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <div className={styles.header}>
                    <h2>Thông tin tài khoản</h2>
                    <div className={styles.headerActions}>
                        <button className={styles.changePassBtn} onClick={() => window.location.href = '/ChangePass'}>
                            <i className="fa-solid fa-key"></i> Đổi mật khẩu
                        </button>
                        {!isEditing && (
                            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                                <i className="fa-solid fa-pen"></i> Chỉnh sửa
                            </button>
                        )}
                    </div>
                </div>

                {error && <div className={styles.errorMsg}>{error}</div>}
                {success && <div className={styles.successMsg}>{success}</div>}

                <div className={styles.content}>
                    {/* User Name (Read-only) */}
                    <div className={styles.field}>
                        <label>Tên đăng nhập</label>
                        <span>{profile.userName}</span>
                    </div>

                    {/* Email (Read-only) */}
                    <div className={styles.field}>
                        <label>Email</label>
                        <span>{profile.email}</span>
                    </div>

                    {/* Full Name */}
                    <div className={styles.field}>
                        <label>Họ tên</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editForm.fullName}
                                onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                            />
                        ) : (
                            <span>{profile.fullName || "Chưa cập nhật"}</span>
                        )}
                    </div>

                    {/* Phone */}
                    <div className={styles.field}>
                        <label>Số điện thoại</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={editForm.phoneNum}
                                onChange={(e) => setEditForm(prev => ({ ...prev, phoneNum: e.target.value }))}
                            />
                        ) : (
                            <span>{profile.phoneNum || "Chưa cập nhật"}</span>
                        )}
                    </div>

                    {/* Address */}
                    <div className={styles.field}>
                        <label>Địa chỉ</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editForm.address}
                                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                            />
                        ) : (
                            <span>{profile.address || "Chưa cập nhật"}</span>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div className={styles.field}>
                        <label>Ngày sinh</label>
                        {isEditing ? (
                            <input
                                type="date"
                                value={editForm.DoB}
                                onChange={(e) => setEditForm(prev => ({ ...prev, DoB: e.target.value }))}
                            />
                        ) : (
                            <span>{profile.DoB ? new Date(profile.DoB).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</span>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div className={styles.actions}>
                        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                            {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                        <button className={styles.cancelBtn} onClick={handleCancel}>
                            Hủy bỏ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
