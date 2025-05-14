# Loyalty System Architecture

## Overview

This document outlines the comprehensive architectural changes to the loyalty system to address the issues with loyalty points not updating properly after purchases.

## Key Components

### 1. State Management with Zustand

We've replaced the context-based state management with a Zustand store that handles:

- Optimistic updates for immediate UI feedback
- Transaction tracking
- Data persistence
- Cache busting
- Centralized state management

The store is located at `lib/loyalty/loyaltyStore.js` and provides a unified API for all loyalty-related operations.

### 2. Transaction-Based Loyalty Updates

We've implemented a transaction-based approach that:

- Records all loyalty point changes in a dedicated collection
- Supports multiple transaction types (EARN, SPEND, EXPIRE, etc.)
- Maintains an audit trail
- Enables easy reconciliation and troubleshooting

### 3. Event-Driven Architecture

We've created a centralized event system that:

- Decouples components through events
- Standardizes event naming conventions
- Provides debugging capabilities
- Ensures consistent handling of loyalty-related events

### 4. Backward Compatibility Layer

To ensure existing components continue to work, we've created:

- A compatibility wrapper for the old LoyaltyProvider API
- Conversion of new state management to match old context API

## Implementation Details

### Zustand Store

The `useLoyaltyStore` provides:

- `userData` - Current user loyalty data
- `progressInfo` - Information about progress to next tier
- `fetchUserData()` - Fetch fresh user data
- `addVivaBucksOptimistic()` - Add points with optimistic UI update
- `confirmTransaction()` - Confirm a transaction was processed
- Automatic event listeners for payment events

### Transaction Model

The `LoyaltyTransaction` model tracks:

- Amount of VivaBucks earned/spent
- Transaction type (EARN, SPEND, etc.)
- Source of transaction (purchase, redemption, etc.)
- Reference IDs for linking to orders/payments
- Metadata for additional context
- Timestamps for auditing

### API Endpoints

New and updated endpoints:

- `/api/loyalty/add-vivabucks` - Add points to a user account
- `/api/user/profile` - Enhanced with better caching control

### Event System

Centralized event emitter with standardized event types:

- Payment events (PAYMENT_COMPLETED, etc.)
- Loyalty events (LOYALTY_UPDATED, etc.)
- User events (USER_PROFILE_UPDATED, etc.)

## Architecture Diagram

```
┌───────────────┐     ┌───────────────┐
│   Payment     │────▶│   Event Bus   │◀───┐
│   Service     │     └───────┬───────┘    │
└───────────────┘             │            │
                              ▼            │
┌───────────────┐     ┌───────────────┐   │
│  Loyalty API  │◀───▶│ Loyalty Store │───┘
│   Endpoints   │     └───────┬───────┘
└───────────────┘             │
                              ▼
┌───────────────┐     ┌───────────────┐
│  Transaction  │◀───▶│    User DB    │
│   Database    │     └───────────────┘
└───────────────┘
```

## Benefits of the New Architecture

1. **Resilience to Network Issues**
   - Optimistic updates ensure UI feels responsive
   - Eventual consistency through transaction tracking

2. **Improved User Experience**
   - Immediate feedback when points are earned
   - Animated progress updates
   - Consistent state across components

3. **Better Maintainability**
   - Centralized state management
   - Clear data flow
   - Easier debugging with transaction history
   - Decoupled components

4. **Performance Improvements**
   - Reduced unnecessary re-renders
   - Cache control to ensure fresh data
   - Optimized database queries with proper indexes

## Migration Approach

The migration strategy allows for incremental adoption:

1. Components can use either the old context API or the new Zustand store
2. The LoyaltyProvider acts as a compatibility layer
3. Events are standardized but backward compatible

## Future Improvements

Potential enhancements for future iterations:

1. Server-side event handling for webhook processing
2. Background jobs for point expiration and tier adjustments
3. Real-time sync using WebSockets for multi-device consistency
4. Analytics dashboard for loyalty program performance metrics 