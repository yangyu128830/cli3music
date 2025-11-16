# Music Backend (Java)

## 项目介绍
这是一个音乐平台的Java后端服务，使用Spring Boot框架实现。

## 技术栈
- Spring Boot 2.6.3
- Spring Data JPA
- SQLite
- JWT
- Spring Security

## 功能模块
- 用户管理：注册、登录、信息更新、密码修改
- 密码安全性检测
- AI智能昵称推荐
- JWT认证

## 环境要求
- JDK 8+ 
- Maven 3.6+ 

## 运行步骤

1. 编译项目
```bash
mvn clean compile
```

2. 运行项目
```bash
mvn spring-boot:run
```

3. 访问API
默认端口：8081

## API接口

### 用户注册
POST /api/register

### 用户登录  
POST /api/login

### 获取用户信息
GET /api/user/info?phone=xxx

### 更新用户信息
PUT /api/user/update

### 修改密码
POST /api/user/change-password

### 检查密码强度
POST /api/check-password

### 推荐昵称
GET /api/recommend-nickname

## 数据库
使用SQLite数据库，文件名为music.db，位于项目根目录。