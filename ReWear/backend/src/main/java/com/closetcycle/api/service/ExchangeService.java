package com.closetcycle.api.service;

import com.closetcycle.api.error.*;
import com.closetcycle.api.model.*;
import com.closetcycle.api.repo.*;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ExchangeService {
    private final ExchangeRepository exchanges;
    private final ClothingItemRepository items;
    private final UserRepository users;
    private final CreditTransactionRepository ledger;
    private final NotificationService notifications;
    public ExchangeService(ExchangeRepository exchanges, ClothingItemRepository items, UserRepository users,
                           CreditTransactionRepository ledger, NotificationService notifications) {
        this.exchanges = exchanges; this.items = items; this.users = users; this.ledger = ledger; this.notifications = notifications;
    }

    @Transactional
    public ExchangeRequest request(Long requesterId, Long itemId, ExchangeType type, Long offeredId) {
        var requested = lockItem(itemId);
        var requester = lockUser(requesterId);
        if (requested.getStatus() != ItemStatus.AVAILABLE) throw new InvalidExchangeException("This listing is no longer available.");
        var owner = lockUser(requested.getOwner().getId());
        if (requester.getId().equals(owner.getId())) throw new InvalidExchangeException("You cannot request your own listing.");
        if (type == null) throw new InvalidExchangeException("Choose direct swap or credits.");
        ClothingItem offered = null;
        int difference;
        if (type == ExchangeType.DIRECT_SWAP) {
            if (offeredId == null) throw new InvalidExchangeException("Choose an item to offer.");
            offered = lockItem(offeredId);
            if (!offered.getOwner().getId().equals(requesterId)) throw new InvalidExchangeException("You can only offer your own listing.");
            if (offered.getStatus() != ItemStatus.AVAILABLE) throw new InvalidExchangeException("Your offered listing is not available.");
            difference = requested.getCreditValue() - offered.getCreditValue();
        } else {
            difference = requested.getCreditValue();
        }
        int amountRequesterMustPay = Math.max(0, difference);
        if (requester.getCreditBalance() < amountRequesterMustPay) throw new InsufficientCreditsException("Not enough swap credits to balance this exchange.");
        if (difference < 0 && owner.getCreditBalance() < Math.abs(difference)) throw new InsufficientCreditsException("The listing owner cannot currently cover the credit difference.");
        var exchange = exchanges.save(new ExchangeRequest(requester, owner, requested, offered, type, difference));
        notifications.notifyUser(owner.getId(), "A new exchange request was received for " + requested.getTitle());
        return exchange;
    }

    @Transactional
    public ExchangeRequest accept(Long exchangeId, Long ownerId) {
        var exchange = lockExchange(exchangeId);
        if (!exchange.getOwner().getId().equals(ownerId)) throw new InvalidExchangeException("Only the listing owner can accept this request.");
        if (exchange.getStatus() != ExchangeStatus.REQUESTED) throw new InvalidExchangeException("This request is no longer pending.");
        var requested = lockItem(exchange.getRequestedItem().getId());
        if (requested.getStatus() != ItemStatus.AVAILABLE) throw new InvalidExchangeException("The requested listing has already been reserved.");
        requested.setStatus(ItemStatus.RESERVED);
        if (exchange.getOfferedItem() != null) {
            var offered = lockItem(exchange.getOfferedItem().getId());
            if (offered.getStatus() != ItemStatus.AVAILABLE) throw new InvalidExchangeException("The offered listing is no longer available.");
            offered.setStatus(ItemStatus.RESERVED);
        }
        exchange.setStatus(ExchangeStatus.ACCEPTED);
        notifications.notifyUser(exchange.getRequester().getId(), "Your exchange request was accepted.");
        return exchange;
    }

    @Transactional public ExchangeRequest decline(Long exchangeId, Long ownerId) {
        var e = lockExchange(exchangeId);
        if (!e.getOwner().getId().equals(ownerId) || e.getStatus() != ExchangeStatus.REQUESTED) throw new InvalidExchangeException("This request cannot be declined by this user.");
        e.setStatus(ExchangeStatus.REJECTED);
        return e;
    }

    @Transactional public ExchangeRequest cancel(Long exchangeId, Long requesterId) {
        var e = lockExchange(exchangeId);
        if (!e.getRequester().getId().equals(requesterId) || e.getStatus() != ExchangeStatus.REQUESTED) throw new InvalidExchangeException("Only a pending request can be cancelled by its requester.");
        e.setStatus(ExchangeStatus.CANCELLED);
        return e;
    }

    @Transactional public ExchangeRequest arrange(Long exchangeId, Long participantId) {
        var e = lockExchange(exchangeId);
        requireParticipant(e, participantId);
        if (e.getStatus() != ExchangeStatus.ACCEPTED) throw new InvalidExchangeException("The exchange must be accepted before arranging handover.");
        e.setStatus(ExchangeStatus.ARRANGED);
        return e;
    }

    @Transactional public ExchangeRequest confirmCompletion(Long exchangeId, Long participantId) {
        var e = lockExchange(exchangeId);
        requireParticipant(e, participantId);
        if (e.getStatus() != ExchangeStatus.ARRANGED) throw new InvalidExchangeException("Both users must arrange the handover before confirming completion.");
        e.confirmFor(participantId);
        if (e.isRequesterConfirmed() && e.isOwnerConfirmed()) settle(e);
        return e;
    }

    private void settle(ExchangeRequest e) {
        var requester = lockUser(e.getRequester().getId());
        var owner = lockUser(e.getOwner().getId());
        int delta = e.getCreditDifference();
        UserAccount payer = delta >= 0 ? requester : owner;
        UserAccount receiver = delta >= 0 ? owner : requester;
        int transfer = Math.abs(delta);
        if (payer.getCreditBalance() < transfer) throw new InsufficientCreditsException("A user no longer has enough credits to settle this exchange.");
        if (transfer > 0) {
            payer.spendCredits(transfer); receiver.addCredits(transfer);
            ledger.save(new CreditTransaction(payer, e, -transfer, "Credits used for completed exchange"));
            ledger.save(new CreditTransaction(receiver, e, transfer, "Credits earned from completed exchange"));
        }
        e.getRequestedItem().setStatus(ItemStatus.EXCHANGED);
        if (e.getOfferedItem() != null) e.getOfferedItem().setStatus(ItemStatus.EXCHANGED);
        e.setStatus(ExchangeStatus.COMPLETED);
        notifications.notifyUser(requester.getId(), "Your exchange is complete. Credits have been settled.");
        notifications.notifyUser(owner.getId(), "Your exchange is complete. Credits have been settled.");
    }

    @Transactional(readOnly = true) public List<ExchangeRequest> forUser(Long userId) { return exchanges.findByRequesterIdOrOwnerId(userId, userId); }
    @Transactional(readOnly = true) public ExchangeRequest get(@NonNull Long id) { return exchanges.findById(id).orElseThrow(() -> new ResourceNotFoundException("Exchange " + id + " was not found.")); }
    private ExchangeRequest lockExchange(Long id) { return exchanges.findForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("Exchange " + id + " was not found.")); }
    private ClothingItem lockItem(Long id) { return items.findForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("Listing " + id + " was not found.")); }
    private UserAccount lockUser(Long id) { return users.findForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("User " + id + " was not found.")); }
    private void requireParticipant(ExchangeRequest e, Long id) {
        if (!e.getRequester().getId().equals(id) && !e.getOwner().getId().equals(id)) throw new InvalidExchangeException("Only an exchange participant can update this exchange.");
    }
}
