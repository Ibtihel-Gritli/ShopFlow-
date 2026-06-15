package com.shopflow.controller;

import com.shopflow.dto.response.AdminDashboardResponse;
import com.shopflow.dto.response.SellerDashboardResponse;
import com.shopflow.security.UserPrincipal;
import com.shopflow.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@AllArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard endpoints")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin dashboard", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Get seller dashboard", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<SellerDashboardResponse> getSellerDashboard(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(dashboardService.getSellerDashboard(userPrincipal.getId()));
    }
}
