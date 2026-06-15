package com.shopflow.mapper;

import com.shopflow.dto.response.OrderResponse;
import com.shopflow.entity.Order;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {OrderItemMapper.class})
public interface OrderMapper {
    OrderResponse toResponse(Order order);
}
