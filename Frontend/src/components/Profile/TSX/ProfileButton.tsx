import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import styles from "./ProfileButton.module.css";

export const ProfileButton = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [userName, setUserName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");
        if (token && user) {
            setIsLoggedIn(true);
            try {
                const userData = JSON.parse(user);
                setUserName(userData.fullName || userData.email || "User");
            } catch {
                setUserName("User");
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setShowMenu(false);
        window.location.href = "/Login";
    };

    if (!isLoggedIn) return null;

    return (
        <div className={styles.container}>
            <button
                className={styles.floatingBtn}
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Profile menu"
            >
                <i className="fa-solid fa-user"></i>
            </button>

            {showMenu && (
                <div className={styles.menu}>
                    <div className={styles.menuHeader}>
                        <i className="fa-solid fa-user-circle"></i>
                        <span>{userName}</span>
                    </div>
                    <hr className={styles.divider} />
                    <button
                        className={styles.menuItem}
                        onClick={() => { navigate("/Profile"); setShowMenu(false); }}
                    >
                        <i className="fa-solid fa-id-card"></i>
                        Thông tin tài khoản
                    </button>
                    <button
                        className={styles.menuItem}
                        onClick={() => { navigate("/ShoppingCart"); setShowMenu(false); }}
                    >
                        <i className="fa-solid fa-shopping-cart"></i>
                        Giỏ hàng
                    </button>
                    <hr className={styles.divider} />
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <i className="fa-solid fa-sign-out-alt"></i>
                        Đăng xuất
                    </button>
                </div>
            )}

            {showMenu && (
                <div className={styles.backdrop} onClick={() => setShowMenu(false)} />
            )}
        </div>
    );
};
