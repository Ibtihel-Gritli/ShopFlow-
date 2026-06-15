package com.shopflow.service;

import com.shopflow.dto.response.AdminDashboardResponse;
import com.shopflow.dto.response.SellerDashboardResponse;
import com.shopflow.entity.Order;
import com.shopflow.entity.OrderItem;
import com.shopflow.entity.OrderStatus;
import com.shopflow.entity.User;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.CouponRepository;
import com.shopflow.repository.OrderItemRepository;
import com.shopflow.repository.OrderRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@AllArgsConstructor
@Slf4j
public class DashboardService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final OrderItemRepository orderItemRepository;

    public AdminDashboardResponse getAdminDashboard() {
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        double totalRevenue = orderRepository.findAll().stream()
                .mapToDouble(Order::getTotal)
                .sum();
        long activeCoupons = couponRepository.countByActiveTrue();

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalRevenue(totalRevenue)
                .activeCoupons(activeCoupons)
                .build();
    }

    public SellerDashboardResponse getSellerDashboard(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", sellerId));

        long totalProducts = productRepository.countBySeller(seller);

        long activeOrders = orderRepository.findAll().stream()
                .filter(order -> order.getItems().stream()
                        .anyMatch(item -> item.getProduct().getSeller().getId().equals(sellerId)))
                .filter(order -> order.getStatus() != OrderStatus.CANCELLED && order.getStatus() != OrderStatus.DELIVERED)
                .count();

        long pendingOrders = orderRepository.findAll().stream()
                .filter(order -> order.getItems().stream()
                        .anyMatch(item -> item.getProduct().getSeller().getId().equals(sellerId)))
                .filter(order -> order.getStatus() == OrderStatus.PENDING)
                .count();

        double totalSales = orderItemRepository.findAll().stream()
                .filter(item -> item.getProduct().getSeller().getId().equals(sellerId))
                .mapToDouble(item -> item.getUnitPrice() * item.getQuantity())
                .sum();

        return SellerDashboardResponse.builder()
                .totalProducts(totalProducts)
                .activeOrders(activeOrders)
                .pendingOrders(pendingOrders)
                .totalSales(totalSales)
                .build();
    }
}
