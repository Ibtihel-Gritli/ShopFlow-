package com.shopflow.service;

import com.shopflow.dto.request.AuthLoginRequest;
import com.shopflow.dto.request.AuthRefreshRequest;
import com.shopflow.dto.request.AuthRegisterRequest;
import com.shopflow.dto.response.AuthTokenResponse;
import com.shopflow.dto.response.UserResponse;
import com.shopflow.entity.User;
import com.shopflow.entity.UserRole;
import com.shopflow.exception.BadRequestException;
import com.shopflow.exception.UnauthorizedException;
import com.shopflow.repository.UserRepository;
import com.shopflow.security.JwtTokenProvider;
import com.shopflow.security.UserPrincipal;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
@AllArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public UserResponse register(AuthRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }

        UserRole role = request.getRole() != null 
            ? UserRole.valueOf(request.getRole().toUpperCase()) 
            : UserRole.CUSTOMER;

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(role)
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("New user registered: {}", savedUser.getEmail());

        return mapToUserResponse(savedUser);
    }

    public AuthTokenResponse login(AuthLoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            String accessToken = tokenProvider.generateAccessToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(authentication);

            log.info("User logged in: {}", request.getEmail());

            return AuthTokenResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .expiresIn(86400L)
                    .tokenType("Bearer")
                    .build();
        } catch (Exception ex) {
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    public AuthTokenResponse refresh(AuthRefreshRequest request) {
        if (!tokenProvider.validateToken(request.getRefreshToken())) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String email = tokenProvider.getEmailFromJWT(request.getRefreshToken());
        Long userId = tokenProvider.getUserIdFromJWT(request.getRefreshToken());

        String newAccessToken = tokenProvider.generateTokenFromUsername(email, userId);

        return AuthTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.getRefreshToken())
                .expiresIn(86400L)
                .tokenType("Bearer")
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().toString())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
