package com.shopflow.service;

import com.shopflow.dto.request.CreateReviewRequest;
import com.shopflow.dto.response.ReviewResponse;
import com.shopflow.entity.Product;
import com.shopflow.entity.Review;
import com.shopflow.entity.User;
import com.shopflow.exception.BadRequestException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.mapper.ReviewMapper;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.ReviewRepository;
import com.shopflow.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@AllArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;

    public ReviewResponse createReview(Long customerId, CreateReviewRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        Review review = Review.builder()
                .customer(customer)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .approved(false)
                .build();

        Review savedReview = reviewRepository.save(review);
        log.info("Review created: {} for product: {}", savedReview.getId(), request.getProductId());

        return reviewMapper.toResponse(savedReview);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        return reviewRepository.findByProductAndApproved(product, true, pageable)
                .map(reviewMapper::toResponse);
    }

    public ReviewResponse approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        review.setApproved(true);
        Review approvedReview = reviewRepository.save(review);
        log.info("Review approved: {}", reviewId);

        return reviewMapper.toResponse(approvedReview);
    }

    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        reviewRepository.delete(review);
        log.info("Review deleted: {}", reviewId);
    }
}
