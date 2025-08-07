package com.drawingapp.config;

import com.drawingapp.entity.User;
import com.drawingapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("user1")) {
            userRepository.save(new User("user1", "password1"));
        }

        if (!userRepository.existsByUsername("user2")) {
            userRepository.save(new User("user2", "password2"));
        }

        if (!userRepository.existsByUsername("user3")) {
            userRepository.save(new User("user3", "password3"));
        }
    }
}
