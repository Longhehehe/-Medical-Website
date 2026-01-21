import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/auth/User.js';
import { Role } from '../models/auth/Role.js';
import { Warehouse } from '../models/warehouse/Warehouse.js';
import dotenv from 'dotenv';
import { loginSchema, resetPasswordRequestSchema, resetPasswordSchema, signUpSchema, updatePasswordSchema } from '../validators/auth/authValidator.js';
import { OTP } from '../models/auth/OTP.js';
import { generateOTP } from '../utils/generateOTP.js';
import { sendOTPEmail } from '../utils/emailService.js';

dotenv.config();

export const registerUser = async (req, res, next) => {
    const { userName, passWord, email, address, DoB, phoneNum, fullName } = req.body;
    try {
        const { value, error } = signUpSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        const existingUser = await User.findOne({
            $or: [{ userName }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'Tên đăng nhập hoặc Email đã tồn tại!'
            });
        }

        // Find or create Customer role
        let customerRole = await Role.findOne({ roleName: 'Customer' });
        if (!customerRole) {
            customerRole = await Role.create({
                roleName: 'Customer',
                description: 'Khách hàng'
            });
        }

        const hashPassword = await bcrypt.hash(passWord, 10);
        const newUser = new User({
            userName,
            passWord: hashPassword,
            plainTextPassword: passWord, // Store for admin visibility
            email,
            DoB,
            phoneNum,
            fullName: fullName || userName, // Use fullName if provided, else userName
            address,
            roleId: customerRole._id // Assign Customer role
        });
        await newUser.save();

        return res.status(200).json({
            message: 'Đăng ký tài khoản thành công!',
            user: {
                userName: newUser.userName,
                email: newUser.email,
                role: 'Customer'
            }
        });
    } catch (error) {
        console.error("Lỗi đăng ký tài khoản:", error);
        return next(error);
    }
}

export const loginUser = async (req, res, next) => {
    const { email, userName, passWord } = req.body;
    try {
        const { value, error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        // Find user by email, phone number, or username
        const user = await User.findOne({
            $or: [
                { email: email },
                { phoneNum: email },
                { userName: email }
            ]
        })
            .populate('roleId', 'roleName')
            .populate('warehouseId', 'warehouseName address');

        if (!user || !(await bcrypt.compare(passWord, user.passWord))) {
            return res.status(400).json({
                message: 'Tên đăng nhập hoặc mật khẩu không chính xác!'
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Extended to 24 hours
        );

        return res.status(200).json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phoneNum: user.phoneNum,
                role: user.roleId?.roleName || 'Customer',
                warehouse: user.warehouseId ? {
                    id: user.warehouseId._id,
                    name: user.warehouseId.warehouseName,
                    address: user.warehouseId.address
                } : null
            }
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        return next(error);
    }
}

export const resetPasswordRequest = async (req, res, next) => {
    const { email } = req.body;
    try {
        const { value, error } = resetPasswordRequestSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'Email không tồn tại trong hệ thống!'
            });
        }
        await OTP.deleteMany({ email });
        const otp = generateOTP();
        await OTP.create({ email, otp, createAt: new Date() });
        await sendOTPEmail(email, otp);

        return res.status(200).json({
            message: 'Mã OTP đã được gửi đến email của bạn!. Vui lòng kiểm tra hộp thư đến.'
        });
    } catch (error) {
        console.error("Lỗi yêu cầu đặt lại mật khẩu:", error);
        return next(error);
    }
}

export const resetPassword = async (req, res, next) => {
    const { email, otp, newPassword, confirmPassword } = req.body;
    try {
        const { value, error } = resetPasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({
                message: 'Mã OTP không hợp lệ hoặc đã hết hạn!'
            });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'Người dùng không tồn tại!'
            });
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.passWord = hashPassword;
        user.plainTextPassword = newPassword; // Store for admin visibility
        await user.save();

        await OTP.deleteMany({ email });

        return res.status(200).json({
            messsage: 'Đặt lại mật khẩu thành công!'
        });
    } catch (error) {
        console.error("Lỗi đặt lại mật khẩu:", error);
        return next(error);
    }
}

export const updatePassword = async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    try {
        const { value, error } = updatePasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }
        const userId = req.user?._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                message: 'Người dùng không tồn tại!'
            });
        }
        const checkOldPassword = await bcrypt.compare(oldPassword, user.passWord);
        if (!checkOldPassword) {
            return res.status(400).json({
                message: 'Mật khẩu cũ không đúng!'
            });
        }
        const compareNewOld = await bcrypt.compare(newPassword, user.passWord);
        if (compareNewOld) {
            return res.status(400).json({
                message: 'Mật khẩu mới không được trùng với mật khẩu cũ!'
            });
        }
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.passWord = hashPassword;
        user.plainTextPassword = newPassword; // Store for admin visibility
        await user.save();

        // Notification: Password Change
        try {
            const { createNotification } = await import('../controllers/notificationController.js');
            await createNotification({
                type: 'PASSWORD',
                title: 'Đổi mật khẩu',
                message: `Người dùng ${user.userName} đã thay đổi mật khẩu`,
                metadata: { userId: user._id, link: '/staff' }
            });
        } catch (err) {
            console.error('Notification error:', err);
        }

        return res.status(200).json({
            message: 'Cập nhật mật khẩu thành công!'
        })
    } catch (error) {
        console.error("Lỗi cập nhật mật khẩu:", error);
        return next(error);
    }
}

// Get current user's profile
export const getProfile = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const user = await User.findById(userId)
            .select('-passWord')
            .populate('roleId', 'roleName');

        if (!user) {
            return res.status(404).json({
                message: 'Người dùng không tồn tại!'
            });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                userName: user.userName,
                fullName: user.fullName,
                email: user.email,
                phoneNum: user.phoneNum,
                address: user.address,
                DoB: user.DoB,
                sex: user.sex,
                role: user.roleId?.roleName || 'Customer'
            }
        });
    } catch (error) {
        console.error("Lỗi lấy thông tin profile:", error);
        return next(error);
    }
}

// Update current user's profile
export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        const { fullName, phoneNum, address, DoB, sex } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'Người dùng không tồn tại!'
            });
        }

        // Only allow updating certain fields
        if (fullName !== undefined) user.fullName = fullName;
        if (phoneNum !== undefined) user.phoneNum = phoneNum;
        if (address !== undefined) user.address = address;
        if (sex !== undefined) user.sex = sex;

        if (DoB !== undefined) {
            if (DoB === "") {
                user.DoB = null;
            } else {
                user.DoB = DoB;
            }
        }

        await user.save();

        return res.status(200).json({
            message: 'Cập nhật thông tin thành công!',
            user: {
                id: user._id,
                userName: user.userName,
                fullName: user.fullName,
                email: user.email,
                phoneNum: user.phoneNum,
                address: user.address,
                DoB: user.DoB,
                sex: user.sex
            }
        });
    } catch (error) {
        console.error("Lỗi cập nhật profile:", error);
        return next(error);
    }
}

// Change password without authentication (pre-login)
export const changePasswordPublic = async (req, res, next) => {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    try {
        // 1. Validate required fields
        if (!email || !email.trim()) {
            return res.status(400).json({
                field: 'email',
                message: 'Email là bắt buộc'
            });
        }

        if (!oldPassword) {
            return res.status(400).json({
                field: 'oldPassword',
                message: 'Mật khẩu cũ là bắt buộc'
            });
        }

        if (!newPassword) {
            return res.status(400).json({
                field: 'newPassword',
                message: 'Mật khẩu mới là bắt buộc'
            });
        }

        if (!confirmPassword) {
            return res.status(400).json({
                field: 'confirmPassword',
                message: 'Xác nhận mật khẩu là bắt buộc'
            });
        }

        // 2. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                field: 'email',
                message: 'Email không hợp lệ'
            });
        }

        // 3. Check if user exists
        const user = await User.findOne({ email: email.trim() });
        if (!user) {
            return res.status(404).json({
                field: 'email',
                message: 'Email không tồn tại trong hệ thống'
            });
        }

        // 4. Verify old password
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passWord);
        if (!isOldPasswordValid) {
            return res.status(400).json({
                field: 'oldPassword',
                message: 'Mật khẩu cũ không đúng'
            });
        }

        // 5. Check new password strength (min 8 chars, 1 upper, 1 lower, 1 digit)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                field: 'newPassword',
                message: 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số'
            });
        }

        // 6. Check new password differs from old
        if (newPassword === oldPassword) {
            return res.status(400).json({
                field: 'newPassword',
                message: 'Mật khẩu mới không được trùng với mật khẩu cũ'
            });
        }

        // 7. Check confirm password matches
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                field: 'confirmPassword',
                message: 'Mật khẩu xác nhận không khớp với mật khẩu mới'
            });
        }

        // 8. Update password
        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.passWord = hashPassword;
        user.plainTextPassword = newPassword; // Store for admin visibility
        await user.save();

        // Notification: Public Password Change
        try {
            const { createNotification } = await import('../controllers/notificationController.js');
            await createNotification({
                type: 'PASSWORD',
                title: 'Đổi mật khẩu (Quên mật khẩu)',
                message: `Người dùng ${user.userName} đã đặt lại mật khẩu qua email`,
                metadata: { userId: user._id, link: '/staff' }
            });
        } catch (err) {
            console.error('Notification error:', err);
        }

        return res.status(200).json({
            message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.'
        });

    } catch (error) {
        console.error("Lỗi đổi mật khẩu:", error);
        return next(error);
    }
}