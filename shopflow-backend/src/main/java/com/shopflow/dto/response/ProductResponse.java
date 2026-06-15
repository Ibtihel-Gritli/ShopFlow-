package com.shopflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Double promoPrice;
    private Integer stock;
    private Boolean active;
    private LocalDateTime createdAt;
    private UserResponse seller;
    private List<CategoryResponse> categories;
}
