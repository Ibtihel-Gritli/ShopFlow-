package com.shopflow.controller;

import com.shopflow.dto.request.CreateSellerProfileRequest;
import com.shopflow.dto.response.SellerProfileResponse;
import com.shopflow.security.UserPrincipal;
import com.shopflow.service.SellerProfileService;
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
@RequestMapping("/seller-profiles")
@AllArgsConstructor
@Tag(name = "Seller Profiles", description = "Seller profile endpoints")
public class SellerProfileController {

    private final SellerProfileService sellerProfileService;

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Create seller profile", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<SellerProfileResponse> createSellerProfile(
            @Valid @RequestBody CreateSellerProfileRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sellerProfileService.createSellerProfile(userPrincipal.getId(), request));
    }

    @GetMapping
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Get my seller profile", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<SellerProfileResponse> getSellerProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(sellerProfileService.getSellerProfile(userPrincipal.getId()));
    }

    @PutMapping
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Update seller profile", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<SellerProfileResponse> updateSellerProfile(
            @Valid @RequestBody CreateSellerProfileRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(sellerProfileService.updateSellerProfile(userPrincipal.getId(), request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get seller profile by ID")
    public ResponseEntity<SellerProfileResponse> getSellerById(@PathVariable Long id) {
        return ResponseEntity.ok(sellerProfileService.getSellerById(id));
    }
}
