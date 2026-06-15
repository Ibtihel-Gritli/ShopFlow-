package com.shopflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerProfileResponse {
    private Long id;
    private UserResponse user;
    private String shopName;
    private String description;
    private String logo;
    private Double rating;
    private LocalDateTime createdAt;
}
