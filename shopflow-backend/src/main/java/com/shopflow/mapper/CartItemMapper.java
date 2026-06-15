package com.shopflow.mapper;

import com.shopflow.dto.response.CartItemResponse;
import com.shopflow.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {ProductMapper.class})
public interface CartItemMapper {
    @Mapping(target = "subtotal", expression = "java(calculateSubtotal(cartItem))")
    CartItemResponse toResponse(CartItem cartItem);

    default Double calculateSubtotal(CartItem cartItem) {
        if (cartItem == null || cartItem.getProduct() == null || cartItem.getQuantity() == null) {
            return 0.0;
        }
        return cartItem.getProduct().getPrice() * cartItem.getQuantity();
    }
}
