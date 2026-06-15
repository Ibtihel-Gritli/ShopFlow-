package com.shopflow.mapper;

import com.shopflow.dto.request.CreateCouponRequest;
import com.shopflow.dto.response.CouponResponse;
import com.shopflow.entity.Coupon;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CouponMapper {
    CouponResponse toResponse(Coupon coupon);
    Coupon toEntity(CreateCouponRequest request);
}
