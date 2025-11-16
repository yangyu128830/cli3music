package com.music.repository;

import com.music.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByPhone(String phone);
    User findByNickname(String nickname);
    User findByEmail(String email);
}