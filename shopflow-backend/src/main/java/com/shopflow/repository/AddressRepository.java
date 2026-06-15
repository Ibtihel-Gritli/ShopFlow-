package com.shopflow.repository;

import com.shopflow.entity.Address;
import com.shopflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser(User user);
    
    Optional<Address> findByUserAndPrimaryTrue(User user);
}
