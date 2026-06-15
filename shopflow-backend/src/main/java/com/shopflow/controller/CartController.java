package com.shopflow.controller;

import com.shopflow.dto.request.AddCartItemRequest;
import com.shopflow.dto.response.CartResponse;
import com.shopflow.security.UserPrincipal;
import com.shopflow.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@AllArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Cart", description = "Shopping cart endpoints")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get user's cart", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(cartService.getCart(userPrincipal.getId()));
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<CartResponse> addCartItem(
            @Valid @RequestBody AddCartItemRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cartService.addItemToCart(userPrincipal.getId(), request));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long itemId,
            @RequestParam Integer quantity,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(cartService.updateCartItem(userPrincipal.getId(), itemId, quantity));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<CartResponse> removeCartItem(
            @PathVariable Long itemId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(cartService.removeCartItem(userPrincipal.getId(), itemId));
    }

    @PostMapping("/coupon")
    @Operation(summary = "Apply coupon to cart", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<CartResponse> applyCoupon(
            @RequestParam String code,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(cartService.applyCoupon(userPrincipal.getId(), code));
    }

    @DeleteMapping("/coupon")
    @Operation(summary = "Remove coupon from cart", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<CartResponse> removeCoupon(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(cartService.removeCoupon(userPrincipal.getId()));
    }
}
