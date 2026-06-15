package com.shopflow.mapper;

import com.shopflow.dto.response.OrderItemResponse;
import com.shopflow.entity.OrderItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProductMapper.class})
public interface OrderItemMapper {
    OrderItemResponse toResponse(OrderItem orderItem);
}
