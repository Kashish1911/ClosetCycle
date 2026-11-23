package com.closetcycle.api.service;

import com.closetcycle.api.dto.ApiDtos.CreateItem;
import com.closetcycle.api.error.ResourceNotFoundException;
import com.closetcycle.api.model.*;
import com.closetcycle.api.repo.ClothingItemRepository;
import com.closetcycle.api.repo.ProMembershipRepository;
import com.closetcycle.api.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ClothingService {
    private final ClothingItemRepository items;
    private final UserService userService;
    private final UserRepository users;
    private final ProMembershipRepository memberships;
    public ClothingService(ClothingItemRepository items, UserService userService, UserRepository users, ProMembershipRepository memberships) {
        this.items = items; this.userService = userService; this.users = users; this.memberships = memberships;
    }
    @Transactional(readOnly = true) public List<ClothingItem> browse(String query, String category, String size, String condition, String color, Integer maxCredits) {
        return items.findByStatus(ItemStatus.AVAILABLE).stream().filter(i -> query == null || i.getTitle().toLowerCase().contains(query.toLowerCase()))
                .filter(i -> category == null || category.isBlank() || i.getCategory().equalsIgnoreCase(category))
                .filter(i -> size == null || size.isBlank() || i.getSize().equalsIgnoreCase(size))
                .filter(i -> condition == null || condition.isBlank() || i.getConditionLabel().equalsIgnoreCase(condition))
                .filter(i -> color == null || color.isBlank() || color.equalsIgnoreCase(i.getColor()))
                .filter(i -> maxCredits == null || i.getCreditValue() <= maxCredits).toList();
    }
    @Transactional public ClothingItem create(CreateItem input) {
        var owner = users.findForUpdate(input.ownerId()).orElseThrow(() -> new ResourceNotFoundException("User " + input.ownerId() + " was not found."));
        long activeListings = items.countByOwnerIdAndStatus(owner.getId(), ItemStatus.AVAILABLE);
        boolean pro = memberships.existsByUserIdAndExpiresAtAfter(owner.getId(), java.time.Instant.now());
        int limit = pro ? 25 : 3;
        if (activeListings >= limit) {
            throw new com.closetcycle.api.error.InvalidExchangeException(pro
                    ? "Pro members can have up to 25 active listings."
                    : "Free accounts can have up to 3 active listings. Activate Pro to list up to 25.");
        }
        return items.save(new ClothingItem(input.title().trim(), input.description(), input.category(), input.size(),
                input.conditionLabel(), input.color(), input.brand(), input.creditValue(), input.imageUrl(), owner));
    }
    @Transactional public ClothingItem update(Long id, CreateItem input) {
        var item = items.findForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("Listing " + id + " was not found."));
        if (!item.getOwner().getId().equals(input.ownerId())) throw new com.closetcycle.api.error.InvalidExchangeException("You can only edit your own listing.");
        if (item.getStatus() == ItemStatus.RESERVED || item.getStatus() == ItemStatus.EXCHANGED) throw new com.closetcycle.api.error.InvalidExchangeException("A reserved or exchanged listing cannot be edited.");
        item.updateDetails(input.title().trim(), input.description(), input.category(), input.size(), input.conditionLabel(), input.color(), input.brand(), input.creditValue(), input.imageUrl() == null ? item.getImageUrl() : input.imageUrl());
        return item;
    }
    @Transactional public ClothingItem changeStatus(Long id, Long ownerId, ItemStatus status) {
        var owner = users.findForUpdate(ownerId).orElseThrow(() -> new ResourceNotFoundException("User " + ownerId + " was not found."));
        var item = items.findForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("Listing " + id + " was not found."));
        if (!item.getOwner().getId().equals(owner.getId())) throw new com.closetcycle.api.error.InvalidExchangeException("You can only change your own listing.");
        if (item.getStatus() == ItemStatus.RESERVED || item.getStatus() == ItemStatus.EXCHANGED) throw new com.closetcycle.api.error.InvalidExchangeException("A reserved or exchanged listing cannot change status.");
        if (status == ItemStatus.AVAILABLE && item.getStatus() != ItemStatus.AVAILABLE) {
            long activeListings = items.countByOwnerIdAndStatus(ownerId, ItemStatus.AVAILABLE);
            boolean pro = memberships.existsByUserIdAndExpiresAtAfter(ownerId, java.time.Instant.now());
            int limit = pro ? 25 : 3;
            if (activeListings >= limit) {
                throw new com.closetcycle.api.error.InvalidExchangeException(pro
                        ? "Pro members can have up to 25 active listings."
                        : "Free accounts can have up to 3 active listings. Activate Pro to list up to 25.");
            }
        }
        item.setStatus(status);
        return item;
    }
    @Transactional(readOnly = true) public ClothingItem get(@NonNull Long id) {
        return items.findById(id).orElseThrow(() -> new ResourceNotFoundException("Listing " + id + " was not found."));
    }
    @Transactional(readOnly = true) public List<ClothingItem> byOwner(@NonNull Long userId) { userService.get(userId); return items.findByOwnerId(userId); }
}
