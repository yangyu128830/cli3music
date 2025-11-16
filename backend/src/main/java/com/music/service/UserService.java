package com.music.service;

import com.music.entity.User;
import com.music.repository.UserRepository;
import com.music.util.PasswordUtil;
import com.music.util.NicknameGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 注册用户
    public User register(User user) {
        User existingUser = userRepository.findByPhone(user.getPhone());
        if (existingUser != null) {
            return null;
        }

        // 加密密码
        user.setPassword(PasswordUtil.encodePassword(user.getPassword()));

        // 如果没有提供昵称，生成一个
        if (user.getNickname() == null || user.getNickname().isEmpty()) {
            user.setNickname(NicknameGenerator.generateNickname());
        }

        return userRepository.save(user);
    }

    // 用户登录
    public User login(String phone, String password) {
        User user = userRepository.findByPhone(phone);
        if (user != null && PasswordUtil.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    // 根据手机号查找用户
    public User findByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    // 根据ID查找用户
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    // 更新用户信息
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    // 修改密码
    public boolean changePassword(String phone, String oldPassword, String newPassword) {
        User user = userRepository.findByPhone(phone);
        if (user != null && PasswordUtil.matches(oldPassword, user.getPassword())) {
            user.setPassword(PasswordUtil.encodePassword(newPassword));
            userRepository.save(user);
            return true;
        }
        return false;
    }

    // 检查密码强度
    public int checkPasswordStrength(String password) {
        return PasswordUtil.checkPasswordStrength(password);
    }

    // 推荐昵称
    public String[] recommendNicknames(int count) {
        return NicknameGenerator.generateNicknames(count);
    }
}