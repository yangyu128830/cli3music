package com.music.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordUtil {

    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // 加密密码
    public static String encodePassword(String password) {
        return encoder.encode(password);
    }

    // 验证密码
    public static boolean matches(String password, String encodedPassword) {
        return encoder.matches(password, encodedPassword);
    }

    // 检查密码强度
    public static int checkPasswordStrength(String password) {
        int strength = 0;

        if (password.length() >= 8) {
            strength++;
        }

        if (password.matches("^(?=.*[a-z]).*$")) {
            strength++;
        }

        if (password.matches("^(?=.*[A-Z]).*$")) {
            strength++;
        }

        if (password.matches("^(?=.*\\d).*$")) {
            strength++;
        }

        if (password.matches("^(?=.*[\\p{Punct}]).*$")) {
            strength++;
        }

        return Math.min(strength, 3); // 0-3 分，3分为强
    }

    // 获取密码强度描述
    public static String getPasswordStrengthText(int strength) {
        switch (strength) {
            case 0:
            case 1:
                return "弱";
            case 2:
                return "中";
            case 3:
                return "强";
            default:
                return "弱";
        }
    }
}