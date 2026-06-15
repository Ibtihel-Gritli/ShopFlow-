package com.shopflow.service;

import com.shopflow.dto.request.CreateCouponRequest;
import com.shopflow.dto.response.CouponResponse;
import com.shopflow.entity.Coupon;
import com.shopflow.entity.CouponType;
import com.shopflow.exception.BadRequestException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.mapper.CouponMapper;
import com.shopflow.repository.CouponRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
@AllArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponMapper couponMapper;

    public CouponResponse createCoupon(CreateCouponRequest request) {
        if (couponRepository.findByCode(request.getCode()).isPresent()) {
            throw new BadRequestException("Coupon with this code already exists");
        }

        CouponType type = CouponType.valueOf(request.getType().toUpperCase());

        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .type(type)
                .value(request.getValue())
                .expirationDate(request.getExpirationDate())
                .maxUses(request.getMaxUses())
                .currentUses(0)
                .active(true)
                .build();

        Coupon savedCoupon = couponRepository.save(coupon);
        log.info("Coupon created: {}", savedCoupon.getId());

        return couponMapper.toResponse(savedCoupon);
    }

    public CouponResponse updateCoupon(Long couponId, CreateCouponRequest request) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", couponId));

        if (!coupon.getCode().equals(request.getCode()) &&
                couponRepository.findByCode(request.getCode()).isPresent()) {
            throw new BadRequestException("Coupon with this code already exists");
        }

        CouponType type = CouponType.valueOf(request.getType().toUpperCase());

        coupon.setCode(request.getCode().toUpperCase());
        coupon.setType(type);
        coupon.setValue(request.getValue());
        coupon.setExpirationDate(request.getExpirationDate());
        coupon.setMaxUses(request.getMaxUses());

        Coupon updatedCoupon = couponRepository.save(coupon);
        log.info("Coupon updated: {}", couponId);

        return couponMapper.toResponse(updatedCoupon);
    }

    public void deleteCoupon(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", couponId));

        couponRepository.delete(coupon);
        log.info("Coupon deleted: {}", couponId);
    }

    @Transactional(readOnly = true)
    public CouponResponse validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCodeAndActive(code, true)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", code));

        if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This coupon has expired");
        }

        if (coupon.getCurrentUses() >= coupon.getMaxUses()) {
            throw new BadRequestException("This coupon has reached its usage limit");
        }

        return couponMapper.toResponse(coupon);
    }

    public void incrementCouponUsage(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", couponId));

        coupon.setCurrentUses(coupon.getCurrentUses() + 1);
        couponRepository.save(coupon);
    }
}
