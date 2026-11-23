package com.closetcycle.api.service;

import com.closetcycle.api.dto.ApiDtos.*;
import com.closetcycle.api.error.InvalidCredentialsException;
import com.closetcycle.api.model.UserAccount;
import com.closetcycle.api.repo.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class AuthService {
    private final UserService users;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtEncoder encoder;
    public AuthService(UserService users, UserRepository userRepository, AuthenticationManager authenticationManager, JwtEncoder encoder) {
        this.users = users; this.userRepository = userRepository; this.authenticationManager = authenticationManager; this.encoder = encoder;
    }
    @Transactional public AuthView register(CreateUser input) {
        UserAccount user = users.create(input);
        return tokenFor(user);
    }
    public AuthView login(Login input) {
        try { authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(input.email().toLowerCase().trim(), input.password())); }
        catch (Exception e) { throw new InvalidCredentialsException(); }
        UserAccount user = userRepository.findByEmail(input.email().toLowerCase().trim()).orElseThrow(InvalidCredentialsException::new);
        return tokenFor(user);
    }
    private AuthView tokenFor(UserAccount user) {
        Instant now = Instant.now();
        var claims = JwtClaimsSet.builder().issuer("closet-cycle-api").issuedAt(now).expiresAt(now.plus(6, ChronoUnit.HOURS))
                .subject(user.getId().toString()).claim("email", user.getEmail()).claim("roles", java.util.List.of(user.getRole().name())).build();
        var header = JwsHeader.with(MacAlgorithm.HS256).type("JWT").build();
        String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new AuthView(token, UserView.from(user));
    }
}
