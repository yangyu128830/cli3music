package com.music.controller;

import com.music.entity.User;
import com.music.service.UserService;
import com.music.util.JwtUtil;
import com.music.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // 注册
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        User registeredUser = userService.register(user);

        if (registeredUser != null) {
            String token = jwtUtil.generateToken(user.getPhone());
            response.put("code", 200);
            response.put("message", "注册成功");
            response.put("user", registeredUser);
            response.put("token", token);
            return ResponseEntity.ok(response);
        } else {
            response.put("code", 400);
            response.put("message", "手机号已经被注册");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 登录
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String phone = loginRequest.get("phone");
        String password = loginRequest.get("password");
        Map<String, Object> response = new HashMap<>();

        User user = userService.login(phone, password);
        if (user != null) {
            String token = jwtUtil.generateToken(phone);
            response.put("code", 200);
            response.put("message", "登录成功");
            response.put("user", user);
            response.put("token", token);
            return ResponseEntity.ok(response);
        } else {
            response.put("code", 401);
            response.put("message", "手机号或密码错误");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    // 获取用户信息
    @GetMapping("/user/info")
    public ResponseEntity<Map<String, Object>> getUserInfo(@RequestParam String phone) {
        Map<String, Object> response = new HashMap<>();
        User user = userService.findByPhone(phone);

        if (user != null) {
            response.put("code", 200);
            response.put("user", user);
            return ResponseEntity.ok(response);
        } else {
            response.put("code", 404);
            response.put("message", "用户不存在");
            return ResponseEntity.notFound().build();
        }
    }

    // 更新用户信息
    @PutMapping("/user/update")
    public ResponseEntity<Map<String, Object>> updateUser(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        User updatedUser = userService.updateUser(user);

        response.put("code", 200);
        response.put("message", "更新成功");
        response.put("user", updatedUser);
        return ResponseEntity.ok(response);
    }

    // 修改密码
    @PostMapping("/user/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> passwordRequest) {
        String phone = passwordRequest.get("phone");
        String oldPassword = passwordRequest.get("oldPassword");
        String newPassword = passwordRequest.get("newPassword");
        Map<String, Object> response = new HashMap<>();

        boolean success = userService.changePassword(phone, oldPassword, newPassword);
        if (success) {
            response.put("code", 200);
            response.put("message", "密码修改成功");
            return ResponseEntity.ok(response);
        } else {
            response.put("code", 400);
            response.put("message", "旧密码错误");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 检查密码强度
    @PostMapping("/check-password")
    public ResponseEntity<Map<String, Object>> checkPassword(@RequestBody Map<String, String> passwordRequest) {
        String password = passwordRequest.get("password");
        Map<String, Object> response = new HashMap<>();

        int strength = PasswordUtil.checkPasswordStrength(password);
        String strengthText = PasswordUtil.getPasswordStrengthText(strength);
        response.put("code", 200);
        response.put("strength", strength);
        response.put("message", strengthText);
        return ResponseEntity.ok(response);
    }

    // 推荐昵称
    @GetMapping("/recommend-nickname")
    public ResponseEntity<Map<String, Object>> recommendNickname(@RequestParam(defaultValue = "5") int count) {
        Map<String, Object> response = new HashMap<>();
        String[] nicknames = userService.recommendNicknames(count);
        response.put("code", 200);
        response.put("nicknames", nicknames);
        return ResponseEntity.ok(response);
    }
}