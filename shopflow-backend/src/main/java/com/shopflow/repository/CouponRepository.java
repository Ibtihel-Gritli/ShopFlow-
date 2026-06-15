package com.shopflow.repository;

import com.shopflow.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);
    
    Optional<Coupon> findByCodeAndActive(String code, Boolean active);
    long countByActiveTrue();
}
