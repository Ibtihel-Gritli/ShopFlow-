package com.shopflow.service;

import com.shopflow.dto.request.CreateSellerProfileRequest;
import com.shopflow.dto.response.SellerProfileResponse;
import com.shopflow.entity.SellerProfile;
import com.shopflow.entity.User;
import com.shopflow.exception.BadRequestException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.mapper.SellerProfileMapper;
import com.shopflow.repository.SellerProfileRepository;
import com.shopflow.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@AllArgsConstructor
@Slf4j
public class SellerProfileService {

    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository userRepository;
    private final SellerProfileMapper sellerProfileMapper;

    public SellerProfileResponse createSellerProfile(Long userId, CreateSellerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (sellerProfileRepository.findByUser(user).isPresent()) {
            throw new BadRequestException("Seller profile already exists for this user");
        }

        SellerProfile sellerProfile = sellerProfileMapper.toEntity(request);
        sellerProfile.setUser(user);
        sellerProfile.setRating(0.0);

        SellerProfile savedProfile = sellerProfileRepository.save(sellerProfile);
        log.info("Seller profile created for user: {}", userId);

        return sellerProfileMapper.toResponse(savedProfile);
    }

    public SellerProfileResponse getSellerProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        SellerProfile sellerProfile = sellerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("SellerProfile", "user_id", userId));

        return sellerProfileMapper.toResponse(sellerProfile);
    }

    public SellerProfileResponse updateSellerProfile(Long userId, CreateSellerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        SellerProfile sellerProfile = sellerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("SellerProfile", "user_id", userId));

        sellerProfile.setShopName(request.getShopName());
        sellerProfile.setDescription(request.getDescription());
        sellerProfile.setLogo(request.getLogo());

        SellerProfile updatedProfile = sellerProfileRepository.save(sellerProfile);
        log.info("Seller profile updated for user: {}", userId);

        return sellerProfileMapper.toResponse(updatedProfile);
    }

    @Transactional(readOnly = true)
    public SellerProfileResponse getSellerById(Long sellerId) {
        SellerProfile sellerProfile = sellerProfileRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("SellerProfile", "id", sellerId));

        return sellerProfileMapper.toResponse(sellerProfile);
    }
}
