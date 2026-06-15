package com.shopflow.service;

import com.shopflow.dto.response.OrderResponse;
import com.shopflow.entity.Cart;
import com.shopflow.entity.Order;
import com.shopflow.entity.OrderItem;
import com.shopflow.entity.OrderStatus;
import com.shopflow.entity.User;
import com.shopflow.exception.BadRequestException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.mapper.OrderMapper;
import com.shopflow.repository.CartItemRepository;
import com.shopflow.repository.CartRepository;
import com.shopflow.repository.CouponRepository;
import com.shopflow.repository.OrderItemRepository;
import com.shopflow.repository.OrderRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    public OrderResponse createOrder(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customer_id", customerId));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        cart.getItems().forEach(cartItem -> {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName());
            }
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        });

        Order order = Order.builder()
                .customer(customer)
                .orderNumber(generateOrderNumber())
                .status(OrderStatus.PENDING)
                .shippingAddress(null)
                .subtotal(calculateSubtotal(cart))
                .shippingCost(10.0)
                .total(calculateTotal(cart))
                .build();

        Order savedOrder = orderRepository.save(order);

        cart.getItems().forEach(cartItem -> {
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(cartItem.getProduct())
                    .variant(cartItem.getVariant())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getProduct().getPrice())
                    .build();
            orderItemRepository.save(orderItem);
        });

        if (cart.getCoupon() != null) {
            Coupon coupon = cart.getCoupon();
            if (!coupon.getActive()) {
                throw new BadRequestException("Coupon is not active");
            }
            if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("Coupon has expired");
            }
            if (coupon.getCurrentUses() >= coupon.getMaxUses()) {
                throw new BadRequestException("Coupon usage limit reached");
            }
            coupon.setCurrentUses(coupon.getCurrentUses() + 1);
            couponRepository.save(coupon);
        }

        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cart.setCoupon(null);
        cartRepository.save(cart);

        log.info("Order created: {} for customer: {}", savedOrder.getId(), customerId);
        return orderMapper.toResponse(savedOrder);
    }

    public OrderResponse getOrderById(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("You can only view your own orders");
        }

        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getCustomerOrders(Long customerId, Pageable pageable) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        return orderRepository.findByCustomer(customer, pageable)
                .map(orderMapper::toResponse);
    }

    public OrderResponse updateOrderStatus(Long orderId, String status, Long adminId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        try {
            OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(newStatus);
            Order updatedOrder = orderRepository.save(order);
            log.info("Order status updated: {} to {}", orderId, newStatus);
            return orderMapper.toResponse(updatedOrder);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid order status: " + status);
        }
    }

    public OrderResponse cancelOrder(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("You can only cancel your own orders");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PAID) {
            throw new BadRequestException("Cannot cancel order with status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order updatedOrder = orderRepository.save(order);
        log.info("Order cancelled: {}", orderId);
        return orderMapper.toResponse(updatedOrder);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(orderMapper::toResponse);
    }

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private Double calculateSubtotal(Cart cart) {
        return cart.getItems().stream()
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();
    }

    private Double calculateTotal(Cart cart) {
        Double subtotal = calculateSubtotal(cart);
        Double shippingCost = 10.0;
        Double discount = 0.0;

        if (cart.getCoupon() != null) {
            if ("PERCENT".equals(cart.getCoupon().getType().toString())) {
                discount = subtotal * (cart.getCoupon().getValue() / 100);
            } else {
                discount = cart.getCoupon().getValue();
            }
        }

        return Math.max(0, subtotal + shippingCost - discount);
    }
}
