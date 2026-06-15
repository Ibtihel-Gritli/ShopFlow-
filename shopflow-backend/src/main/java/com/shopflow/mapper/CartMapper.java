package com.shopflow.mapper;

import com.shopflow.dto.response.CartResponse;
import com.shopflow.entity.Cart;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CartItemMapper.class, CouponMapper.class})
public interface CartMapper {
    @Mapping(target = "subtotal", expression = "java(calculateSubtotal(cart))")
    @Mapping(target = "total", expression = "java(calculateTotal(cart))")
    CartResponse toResponse(Cart cart);

    default Double calculateSubtotal(Cart cart) {
        if (cart == null || cart.getItems() == null) {
            return 0.0;
        }
        return cart.getItems().stream()
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();
    }

    default Double calculateTotal(Cart cart) {
        double subtotal = calculateSubtotal(cart);
        double couponDiscount = 0.0;
        if (cart != null && cart.getCoupon() != null) {
            if (cart.getCoupon().getType() != null) {
                switch (cart.getCoupon().getType()) {
                    case PERCENT -> couponDiscount = subtotal * (cart.getCoupon().getValue() / 100);
                    case FIXED -> couponDiscount = cart.getCoupon().getValue();
                }
            }
        }
        return Math.max(0.0, subtotal - couponDiscount + 10.0);
    }
}
