package com.closetcycle.api.repo;
import com.closetcycle.api.model.ClothingItem;
import com.closetcycle.api.model.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.List;
public interface ClothingItemRepository extends JpaRepository<ClothingItem, Long> {
    List<ClothingItem> findByStatus(ItemStatus status);
    List<ClothingItem> findByOwnerId(Long ownerId);
    long countByOwnerIdAndStatus(Long ownerId, ItemStatus status);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select i from ClothingItem i where i.id = :id")
    java.util.Optional<ClothingItem> findForUpdate(@Param("id") Long id);
}
