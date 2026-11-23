package com.closetcycle.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;
import com.closetcycle.api.model.UserRole;
import com.closetcycle.api.repo.UserRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ClosetCycleApiIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepository users;
    private String mayaToken;
    private String amaraToken;

    @NonNull private String jsonBody(Object value) throws Exception {
        return java.util.Objects.requireNonNull(json.writeValueAsString(value));
    }

    @BeforeEach
    void authenticateDemoUsers() throws Exception {
        mayaToken = login("maya@closetcycle.local", "demo-password-1");
        amaraToken = login("amara@closetcycle.local", "demo-password-2");
    }

    private String login(String email, String password) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content(jsonBody(java.util.Map.of("email", email, "password", password))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        JsonNode node = json.readTree(body);
        return node.get("accessToken").asText();
    }

    @Test @Transactional
    void browseIsPublicAndReturnsSeededListings() throws Exception {
        mvc.perform(get("/api/items"))
                .andExpect(status().isOk())
                .andExpect(result -> org.junit.jupiter.api.Assertions.assertEquals(8,
                        json.readTree(result.getResponse().getContentAsString()).size()))
                .andExpect(jsonPath("$[0].title").value("Vintage denim jacket"));
    }

    @Test @Transactional
    void listingFiltersApplyTogether() throws Exception {
        mvc.perform(get("/api/items").param("category", "Bottoms").param("size", "S").param("maxCredits", "100"))
                .andExpect(status().isOk())
                .andExpect(result -> org.junit.jupiter.api.Assertions.assertEquals(1,
                        json.readTree(result.getResponse().getContentAsString()).size()))
                .andExpect(jsonPath("$[0].title").value("Soft linen trousers"));
    }

    @Test @Transactional
    void walletRequiresAuthentication() throws Exception {
        mvc.perform(get("/api/wallet/1")).andExpect(status().isUnauthorized());
    }

    @Test @Transactional
    void registrationStoresAProfileAndIssuesToken() throws Exception {
        mvc.perform(post("/api/auth/register").contentType("application/json")
                        .content("{\"displayName\":\"Test Member\",\"email\":\"member-" + System.nanoTime() + "@example.test\",\"area\":\"North Campus\",\"password\":\"safe-demo-password\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user.creditBalance").value(200));
    }

    @Test @Transactional
    void duplicateRegistrationIsRejected() throws Exception {
        String email = "duplicate-" + System.nanoTime() + "@example.test";
        String body = "{\"displayName\":\"One\",\"email\":\"" + email + "\",\"area\":\"Campus\",\"password\":\"safe-demo-password\"}";
        mvc.perform(post("/api/auth/register").contentType("application/json").content(body)).andExpect(status().isCreated());
        mvc.perform(post("/api/auth/register").contentType("application/json").content(body)).andExpect(status().isConflict());
    }

    @Test @Transactional
    void loginRejectsIncorrectPassword() throws Exception {
        mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"email\":\"maya@closetcycle.local\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test @Transactional
    void memberCannotReadAnotherMembersWallet() throws Exception {
        mvc.perform(get("/api/wallet/2").header("Authorization", "Bearer " + mayaToken)).andExpect(status().isForbidden());
    }

    @Test @Transactional
    void creatingListingRequiresAuthentication() throws Exception {
        mvc.perform(post("/api/items").contentType("application/json")
                        .content("{\"title\":\"Test jacket\",\"category\":\"Jackets\",\"size\":\"M\",\"conditionLabel\":\"Good\",\"creditValue\":40,\"ownerId\":1}"))
                .andExpect(status().isUnauthorized());
    }

    @Test @Transactional
    void memberCannotCreateListingForSomeoneElse() throws Exception {
        mvc.perform(post("/api/items").header("Authorization", "Bearer " + mayaToken).contentType("application/json")
                        .content("{\"title\":\"Test jacket\",\"category\":\"Jackets\",\"size\":\"M\",\"conditionLabel\":\"Good\",\"creditValue\":40,\"ownerId\":2}"))
                .andExpect(status().isForbidden());
    }

    @Test @Transactional
    void blankListingTitleIsRejected() throws Exception {
        mvc.perform(post("/api/items").header("Authorization", "Bearer " + mayaToken).contentType("application/json")
                        .content("{\"title\":\" \",\"category\":\"Jackets\",\"size\":\"M\",\"conditionLabel\":\"Good\",\"creditValue\":40,\"ownerId\":1}"))
                .andExpect(status().isBadRequest());
    }

    @Test @Transactional
    void directExchangeCompletesOnlyAfterBothUsersConfirm() throws Exception {
        String response = mvc.perform(post("/api/exchanges").header("Authorization", "Bearer " + mayaToken)
                        .contentType("application/json")
                        .content("{\"requesterId\":1,\"requestedItemId\":1,\"type\":\"DIRECT_SWAP\",\"offeredItemId\":7}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("REQUESTED"))
                .andExpect(jsonPath("$.creditDifference").value(10)).andReturn().getResponse().getContentAsString();
        long id = json.readTree(response).get("id").asLong();

        mvc.perform(post("/api/exchanges/{id}/accept", id).param("ownerId", "2").header("Authorization", "Bearer " + amaraToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ACCEPTED"));
        mvc.perform(post("/api/exchanges/{id}/arrange", id).param("participantId", "1").header("Authorization", "Bearer " + mayaToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ARRANGED"));
        mvc.perform(post("/api/exchanges/{id}/confirm", id).param("participantId", "1").header("Authorization", "Bearer " + mayaToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ARRANGED"))
                .andExpect(jsonPath("$.requesterConfirmed").value(true));
        mvc.perform(post("/api/exchanges/{id}/confirm", id).param("participantId", "2").header("Authorization", "Bearer " + amaraToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.ownerConfirmed").value(true));
        mvc.perform(get("/api/wallet/1").header("Authorization", "Bearer " + mayaToken)).andExpect(status().isOk()).andExpect(jsonPath("$.creditBalance").value(190));
        mvc.perform(get("/api/wallet/2").header("Authorization", "Bearer " + amaraToken)).andExpect(status().isOk()).andExpect(jsonPath("$.creditBalance").value(210));
    }

    @Test @Transactional
    void userCannotAcceptAnotherOwnersRequest() throws Exception {
        String response = mvc.perform(post("/api/exchanges").header("Authorization", "Bearer " + mayaToken)
                        .contentType("application/json")
                        .content("{\"requesterId\":1,\"requestedItemId\":1,\"type\":\"CREDITS\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long id = json.readTree(response).get("id").asLong();
        mvc.perform(post("/api/exchanges/{id}/accept", id).param("ownerId", "1").header("Authorization", "Bearer " + mayaToken))
                .andExpect(status().isConflict());
    }

    @Test @Transactional
    void requesterCannotRequestTheirOwnListing() throws Exception {
        mvc.perform(post("/api/exchanges").header("Authorization", "Bearer " + mayaToken).contentType("application/json")
                        .content("{\"requesterId\":1,\"requestedItemId\":7,\"type\":\"CREDITS\"}"))
                .andExpect(status().isConflict());
    }

    @Test @Transactional
    void insufficientCreditRequestIsRejected() throws Exception {
        String leoToken = login("leo@closetcycle.local", "demo-password-3");
        String listing = mvc.perform(post("/api/items").header("Authorization", "Bearer " + leoToken).contentType("application/json")
                        .content("{\"title\":\"High value coat\",\"category\":\"Jackets\",\"size\":\"M\",\"conditionLabel\":\"Good\",\"creditValue\":500,\"ownerId\":3}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long itemId = json.readTree(listing).get("id").asLong();
        mvc.perform(post("/api/exchanges").header("Authorization", "Bearer " + mayaToken).contentType("application/json")
                        .content("{\"requesterId\":1,\"requestedItemId\":" + itemId + ",\"type\":\"CREDITS\"}"))
                .andExpect(status().isConflict());
    }

    @Test @Transactional
    void userCannotConfirmAnotherUsersExchange() throws Exception {
        String response = mvc.perform(post("/api/exchanges").header("Authorization", "Bearer " + mayaToken).contentType("application/json")
                        .content("{\"requesterId\":1,\"requestedItemId\":1,\"type\":\"CREDITS\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long id = json.readTree(response).get("id").asLong();
        mvc.perform(post("/api/exchanges/{id}/confirm", id).param("participantId", "3").header("Authorization", "Bearer " + mayaToken))
                .andExpect(status().isForbidden());
    }

    @Test @Transactional
    void memberCanReportAnotherMembersListingAndModeratorCanResolveIt() throws Exception {
        String report = mvc.perform(post("/api/items/1/reports").header("Authorization", "Bearer " + mayaToken)
                        .contentType("application/json")
                        .content("{\"reason\":\"Condition does not match\",\"details\":\"The listing description is inaccurate.\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.itemId").value(1)).andReturn().getResponse().getContentAsString();
        long reportId = json.readTree(report).get("id").asLong();
        users.findById(3L).orElseThrow().setRole(UserRole.MODERATOR);
        String moderatorToken = login("leo@closetcycle.local", "demo-password-3");
        mvc.perform(get("/api/admin/reports").header("Authorization", "Bearer " + moderatorToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(reportId));
        mvc.perform(patch("/api/admin/reports/{id}", reportId).param("status", "RESOLVED")
                        .header("Authorization", "Bearer " + moderatorToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("RESOLVED"));
    }

    @Test @Transactional
    void memberCannotOpenModeratorReportQueue() throws Exception {
        mvc.perform(get("/api/admin/reports").header("Authorization", "Bearer " + mayaToken))
                .andExpect(status().isForbidden());
    }

    @Test @Transactional
    void memberCannotReportTheirOwnListing() throws Exception {
        mvc.perform(post("/api/items/7/reports").header("Authorization", "Bearer " + mayaToken)
                        .contentType("application/json").content("{\"reason\":\"Other\",\"details\":\"Test\"}"))
                .andExpect(status().isConflict());
    }

    @Test @Transactional
    void onlyAdminCanCreateProActivationCodesAndCodeCanBeRedeemedOnce() throws Exception {
        String input = "{\"plan\":\"MONTHLY\"}";
        mvc.perform(post("/api/admin/pro-codes").header("Authorization", "Bearer " + mayaToken)
                        .contentType("application/json").content(input))
                .andExpect(status().isForbidden());

        users.findById(2L).orElseThrow().setRole(UserRole.ADMIN);
        String adminToken = login("amara@closetcycle.local", "demo-password-2");
        String response = mvc.perform(post("/api/admin/pro-codes").header("Authorization", "Bearer " + adminToken)
                        .contentType("application/json").content(input))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.code").isNotEmpty())
                .andExpect(jsonPath("$.plan").value("MONTHLY")).andReturn().getResponse().getContentAsString();
        String code = json.readTree(response).get("code").asText();

        mvc.perform(post("/api/pro/activation-codes/redeem").header("Authorization", "Bearer " + mayaToken)
                        .contentType("application/json").content(jsonBody(java.util.Map.of("code", code))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.plan").value("MONTHLY")).andExpect(jsonPath("$.expiresAt").isNotEmpty());
        mvc.perform(post("/api/pro/activation-codes/redeem").header("Authorization", "Bearer " + amaraToken)
                        .contentType("application/json").content(jsonBody(java.util.Map.of("code", code))))
                .andExpect(status().isConflict());
    }

    @Test @Transactional
    void proMembershipRaisesTheServerEnforcedListingLimit() throws Exception {
        users.findById(2L).orElseThrow().setRole(UserRole.ADMIN);
        String adminToken = login("amara@closetcycle.local", "demo-password-2");
        String response = mvc.perform(post("/api/admin/pro-codes").header("Authorization", "Bearer " + adminToken)
                        .contentType("application/json").content("{\"plan\":\"ANNUAL\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String code = json.readTree(response).get("code").asText();
        mvc.perform(post("/api/pro/activation-codes/redeem").header("Authorization", "Bearer " + mayaToken)
                        .contentType("application/json").content(jsonBody(java.util.Map.of("code", code))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.plan").value("ANNUAL"));

        String item = "{\"title\":\"Pro listing\",\"category\":\"Tops\",\"size\":\"M\",\"conditionLabel\":\"Good\",\"creditValue\":40,\"ownerId\":1}";
        mvc.perform(post("/api/items").header("Authorization", "Bearer " + mayaToken).contentType("application/json").content(item))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/items").header("Authorization", "Bearer " + mayaToken).contentType("application/json").content(item))
                .andExpect(status().isCreated());
    }

    @Test @Transactional
    void checkoutDoesNotGrantProWhenRazorpayIsNotConfigured() throws Exception {
        mvc.perform(post("/api/pro/payments/orders").header("Authorization", "Bearer " + mayaToken)
                        .contentType("application/json").content("{\"plan\":\"MONTHLY\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("Razorpay is not configured. Set the server-side Razorpay key ID and key secret before enabling checkout."));
        mvc.perform(get("/api/pro/membership").header("Authorization", "Bearer " + mayaToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.active").value(false));
    }
}
