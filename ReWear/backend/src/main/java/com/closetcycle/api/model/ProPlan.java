package com.closetcycle.api.model;

import java.time.Instant;
import java.time.ZoneOffset;

public enum ProPlan {
    MONTHLY(4_900, 1),
    ANNUAL(39_900, 12);

    private final int amountPaise;
    private final int months;

    ProPlan(int amountPaise, int months) {
        this.amountPaise = amountPaise;
        this.months = months;
    }

    public int getAmountPaise() { return amountPaise; }
    public Instant expiresAfter(Instant start) { return start.atZone(ZoneOffset.UTC).plusMonths(months).toInstant(); }
}
