package com.closetcycle.api.config;

import com.closetcycle.api.model.ClothingItem;
import com.closetcycle.api.model.UserAccount;
import com.closetcycle.api.repo.ClothingItemRepository;
import com.closetcycle.api.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("!prod")
public class DemoData {
    @Bean CommandLineRunner seedDemoData(UserRepository users, ClothingItemRepository items, PasswordEncoder passwordEncoder) {
        return args -> {
            if (users.count() > 0) return;
            var maya = users.save(new UserAccount("Maya Jensen", "maya@closetcycle.local", "North Campus"));
            var amara = users.save(new UserAccount("Amara R.", "amara@closetcycle.local", "North Campus"));
            var leo = users.save(new UserAccount("Leo T.", "leo@closetcycle.local", "Riverside"));
            maya.setPasswordHash(passwordEncoder.encode("demo-password-1"));
            amara.setPasswordHash(passwordEncoder.encode("demo-password-2"));
            leo.setPasswordHash(passwordEncoder.encode("demo-password-3"));
            users.save(maya);
            users.save(amara);
            users.save(leo);
            var rows = new Object[][]{
                    {"Vintage denim jacket", "A much-loved layering staple.", "Jackets", "M", "Very good", "Blue", "Unbranded", 120, "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?auto=format&fit=crop&w=900&q=85", amara},
                    {"Terracotta floral dress", "Lightweight floral midi dress.", "Dresses", "S", "Like new", "Terracotta", "Unbranded", 140, "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=85", amara},
                    {"Olive wool coat", "Warm everyday wool coat.", "Jackets", "L", "Good", "Green", "Unbranded", 180, "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=85", amara},
                    {"Wide-leg black jeans", "Relaxed fit black denim.", "Bottoms", "28", "Very good", "Black", "Unbranded", 90, "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=85", amara},
                    {"Cotton striped shirt", "Soft cotton shirt with blue stripes.", "Tops", "M", "Very good", "Cream", "Unbranded", 75, "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85", amara},
                    {"Everyday canvas tote", "Sturdy canvas carry-all.", "Accessories", "One size", "Good", "Cream", "Unbranded", 45, "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=85", amara},
                    {"Forest knit cardigan", "Cosy cardigan in forest green.", "Knitwear", "M", "Like new", "Green", "Unbranded", 110, "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85", maya},
                    {"Soft linen trousers", "Easy, breathable linen trousers.", "Bottoms", "S", "Very good", "Cream", "Unbranded", 95, "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85", maya}
            };
            for (Object[] x : rows) items.save(new ClothingItem((String)x[0], (String)x[1], (String)x[2], (String)x[3],
                    (String)x[4], (String)x[5], (String)x[6], (int)x[7], (String)x[8], (UserAccount)x[9]));
        };
    }
}
