package com.shopflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCouponRequest {
    
    @NotBlank(message = "Coupon code is required")
    private String code;
    
    @NotBlank(message = "Coupon type is required")
    private String type; // PERCENT or FIXED
    
    @NotNull(message = "Value is required")
    @Positive(message = "Value must be greater than 0")
    private Double value;
    
    private LocalDateTime expirationDate;
    
    @NotNull(message = "Max uses is required")
    @Positive(message = "Max uses must be greater than 0")
    private Integer maxUses;
}
