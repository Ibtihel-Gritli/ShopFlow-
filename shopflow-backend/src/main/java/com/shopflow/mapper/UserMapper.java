package com.shopflow.mapper;

import com.shopflow.dto.response.UserResponse;
import com.shopflow.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
    User toEntity(UserResponse userResponse);
}
