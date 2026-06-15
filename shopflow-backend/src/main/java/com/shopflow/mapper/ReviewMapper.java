package com.shopflow.mapper;

import com.shopflow.dto.request.CreateReviewRequest;
import com.shopflow.dto.response.ReviewResponse;
import com.shopflow.entity.Review;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class, ProductMapper.class})
public interface ReviewMapper {
    ReviewResponse toResponse(Review review);
    Review toEntity(CreateReviewRequest request);
}
