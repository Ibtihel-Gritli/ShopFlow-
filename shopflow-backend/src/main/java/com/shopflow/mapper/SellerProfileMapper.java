package com.shopflow.mapper;

import com.shopflow.dto.request.CreateSellerProfileRequest;
import com.shopflow.dto.response.SellerProfileResponse;
import com.shopflow.entity.SellerProfile;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface SellerProfileMapper {
    SellerProfileResponse toResponse(SellerProfile sellerProfile);
    SellerProfile toEntity(CreateSellerProfileRequest request);
}
