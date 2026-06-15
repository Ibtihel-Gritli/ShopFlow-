package com.shopflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerDashboardResponse {
    private long totalProducts;
    private long activeOrders;
    private long pendingOrders;
    private double totalSales;
}
