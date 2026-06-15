package com.shopflow.service;

import com.shopflow.dto.request.AddCartItemRequest;
import com.shopflow.dto.response.CartResponse;
import com.shopflow.entity.Cart;
import com.shopflow.entity.CartItem;
import com.shopflow.entity.Coupon;
import com.shopflow.entity.Product;
import com.shopflow.entity.User;
import com.shopflow.exception.BadRequestException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.mapper.CartMapper;
import com.shopflow.repository.CartItemRepository;
import com.shopflow.repository.CartRepository;
import com.shopflow.repository.CouponRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
@AllArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final CartMapper cartMapper;

    public CartResponse getCart(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customer_id", customerId));

        return cartMapper.toResponse(cart);
    }

    public CartResponse addItemToCart(Long customerId, AddCartItemRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock for this product");
        }

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .customer(customer)
                            .build();
                    return cartRepository.save(newCart);
                });

        Optional<CartItem> existingItem = cartItemRepository.findByCartAndProduct(cart, product);

        if (existingItem.isPresent()) {
            CartItem cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(cartItem);
        } else {
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(null)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(cartItem);
        }

        log.info("Item added to cart for customer: {}", customerId);
        return cartMapper.toResponse(cart);
    }

    public CartResponse updateCartItem(Long customerId, Long cartItemId, Integer quantity) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customer_id", customerId));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("This cart item does not belong to your cart");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            Product product = cartItem.getProduct();
            if (product.getStock() < quantity) {
                throw new BadRequestException("Insufficient stock for this product");
            }
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        log.info("Cart item updated: {}", cartItemId);
        return cartMapper.toResponse(cart);
    }

    public CartResponse removeCartItem(Long customerId, Long cartItemId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customer_id", customerId));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("This cart item does not belong to your cart");
        }

        cartItemRepository.delete(cartItem);
        log.info("Cart item removed: {}", cartItemId);
        return cartMapper.toResponse(cart);
    }

    public CartResponse applyCoupon(Long customerId, String couponCode) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customer_id", customerId));

        Coupon coupon = couponRepository.findByCodeAndActive(couponCode, true)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "code", couponCode));

        if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This coupon has expired");
        }

        if (coupon.getCurrentUses() >= coupon.getMaxUses()) {
            throw new BadRequestException("This coupon has reached its usage limit");
        }

        cart.setCoupon(coupon);
        cartRepository.save(cart);

        log.info("Coupon applied to cart: {}", customerId);
        return cartMapper.toResponse(cart);
    }

    public CartResponse removeCoupon(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        Cart cart = cartRepository.findByCustomer(customer)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customer_id", customerId));

        cart.setCoupon(null);
        cartRepository.save(cart);

        log.info("Coupon removed from cart: {}", customerId);
        return cartMapper.toResponse(cart);
    }
}
