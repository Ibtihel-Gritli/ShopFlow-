package com.shopflow.service;

import com.shopflow.dto.request.CreateProductRequest;
import com.shopflow.dto.response.ProductResponse;
import com.shopflow.entity.Category;
import com.shopflow.entity.Product;
import com.shopflow.entity.User;
import com.shopflow.exception.BadRequestException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.mapper.ProductMapper;
import com.shopflow.repository.CategoryRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    public ProductResponse createProduct(CreateProductRequest request, Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", sellerId));

        Product product = productMapper.toEntity(request);
        product.setSeller(seller);
        product.setActive(true);

        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            Set<Category> categories = request.getCategoryIds().stream()
                    .map(categoryId -> categoryRepository.findById(categoryId)
                            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId)))
                    .collect(Collectors.toSet());
            product.setCategories(categories);
        }

        Product savedProduct = productRepository.save(product);
        log.info("Product created: {} by seller: {}", savedProduct.getId(), sellerId);

        return productMapper.toResponse(savedProduct);
    }

    public ProductResponse updateProduct(Long productId, CreateProductRequest request, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new BadRequestException("You can only update your own products");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setPromoPrice(request.getPromoPrice());
        product.setStock(request.getStock());

        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            Set<Category> categories = request.getCategoryIds().stream()
                    .map(categoryId -> categoryRepository.findById(categoryId)
                            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId)))
                    .collect(Collectors.toSet());
            product.setCategories(categories);
        }

        Product updatedProduct = productRepository.save(product);
        log.info("Product updated: {}", productId);

        return productMapper.toResponse(updatedProduct);
    }

    public void deleteProduct(Long productId, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new BadRequestException("You can only delete your own products");
        }

        productRepository.delete(product);
        log.info("Product deleted: {}", productId);
    }

    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findByActive(true, pageable)
                .map(productMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String search, Long categoryId, Double minPrice, Double maxPrice, Pageable pageable) {
        if (search != null && search.isBlank()) {
            search = null;
        }
        return productRepository.searchByFilters(search, categoryId, minPrice, maxPrice, pageable)
                .map(productMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getTopSellingProducts() {
        return productRepository.findTopSellingProducts(org.springframework.data.domain.PageRequest.of(0, 10)).stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        return productRepository.findByCategory(categoryId, pageable)
                .map(productMapper::toResponse);
    }

    public void validateStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (product.getStock() < quantity) {
            throw new BadRequestException("Insufficient stock for product: " + product.getName());
        }
    }
}
