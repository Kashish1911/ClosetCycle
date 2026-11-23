package com.closetcycle.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "clothing_items")
public class ClothingItem extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Column(nullable = false, length = 120)
    private String title;
    @Column(length = 1200)
    private String description;
    @NotBlank @Column(nullable = false, length = 40)
    private String category;
    @NotBlank @Column(nullable = false, length = 30)
    private String size;
    @NotBlank @Column(nullable = false, length = 30)
    private String conditionLabel;
    @Column(length = 40)
    private String color;
    @Column(length = 80)
    private String brand;
    @Min(1) @Column(nullable = false)
    private int creditValue;
    @Column(length = 300)
    private String imageUrl;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private ItemStatus status = ItemStatus.AVAILABLE;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private UserAccount owner;

    protected ClothingItem() { }
    public ClothingItem(String title, String description, String category, String size, String conditionLabel,
                        String color, String brand, int creditValue, String imageUrl, UserAccount owner) {
        this.title = title; this.description = description; this.category = category; this.size = size;
        this.conditionLabel = conditionLabel; this.color = color; this.brand = brand;
        this.creditValue = creditValue; this.imageUrl = imageUrl; this.owner = owner;
    }
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getSize() { return size; }
    public String getConditionLabel() { return conditionLabel; }
    public String getColor() { return color; }
    public String getBrand() { return brand; }
    public int getCreditValue() { return creditValue; }
    public String getImageUrl() { return imageUrl; }
    public ItemStatus getStatus() { return status; }
    public UserAccount getOwner() { return owner; }
    public void setStatus(ItemStatus status) { this.status = status; }
    public void updateDetails(String title, String description, String category, String size, String conditionLabel,
                             String color, String brand, int creditValue, String imageUrl) {
        this.title = title; this.description = description; this.category = category; this.size = size;
        this.conditionLabel = conditionLabel; this.color = color; this.brand = brand;
        this.creditValue = creditValue; if (imageUrl != null && !imageUrl.isBlank()) this.imageUrl = imageUrl;
    }
}
