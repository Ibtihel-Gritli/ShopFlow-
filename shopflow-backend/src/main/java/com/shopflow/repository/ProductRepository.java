package com.shopflow.repository;

import com.shopflow.entity.Product;
import com.shopflow.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Page<Product> findByActive(Boolean active, Pageable pageable);
    
    Page<Product> findBySeller(User seller, Pageable pageable);
    long countBySeller(User seller);
    
    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:categoryId IS NULL OR EXISTS (SELECT 1 FROM p.categories c WHERE c.id = :categoryId)) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> searchByFilters(
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            Pageable pageable);
    
    @Query("SELECT p FROM OrderItem oi JOIN oi.product p WHERE p.active = true GROUP BY p ORDER BY SUM(oi.quantity) DESC")
    Page<Product> findTopSellingProducts(Pageable pageable);
    
    @Query("SELECT p FROM Product p JOIN p.categories c WHERE c.id = :categoryId AND p.active = true")
    Page<Product> findByCategory(@Param("categoryId") Long categoryId, Pageable pageable);
}
