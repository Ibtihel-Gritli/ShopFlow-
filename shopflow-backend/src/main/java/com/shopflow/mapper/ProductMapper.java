package com.shopflow.mapper;

import com.shopflow.dto.request.CreateProductRequest;
import com.shopflow.dto.response.ProductResponse;
import com.shopflow.entity.Product;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class, CategoryMapper.class})
public interface ProductMapper {
    ProductResponse toResponse(Product product);
    Product toEntity(CreateProductRequest request);
}
