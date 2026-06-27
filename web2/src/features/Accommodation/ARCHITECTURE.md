# Accommodation Frontend Architecture

This module is the single home for all accommodation domain logic on the frontend.

## Goals

- Keep request validation, view types, HTTP calls, and UI behavior separated.
- Make traveller and merchant flows share the same domain contracts.
- Keep pages thin so all API calls happen inside hooks.
- Make the module scalable by feature and by use-case, not by endpoint.

## Canonical Folder Layout

```text
src/features/Accommodation/
  api/        # pure HTTP calls only
  schemas/    # Zod request DTOs only
  types/      # response/view interfaces only
  hooks/      # use-case logic and orchestration
  components/ # reusable UI only
  utils/      # pure helpers
```

## Layer Rules

### 1) DTO Layer (`schemas/`)

Use Zod only for input validation.

- Request payloads only: create, update, query, params.
- No response parsing.
- Export inferred request types from the schema.
- Naming must mirror backend DTO names.

Recommended naming:

- `createAccommodationSchema`
- `updateAccommodationSchema = createAccommodationSchema.partial()`
- `listPropertiesQuerySchema`
- `listLocksQuerySchema`
- `listBookingsQuerySchema`
- `propertyIdParamsSchema`

Type exports should follow backend naming exactly:

- `CreateAccommodationCompleteDto`
- `UpdatePropertyDto`
- `ListPropertiesQueryDto`
- `ListLocksQueryDto`
- `ListBookingsQueryDto`

If the frontend keeps a local alias, it should be a thin re-export of the backend-matched name, not a new contract.

### 2) View Types (`types/`)

Use interfaces for API responses only.

- No validation logic.
- No form defaults.
- No request-only fields.
- Include DB fields, computed fields, and nested relations.

Examples:

- `IAccommodationView`
- `IPropertySummaryView`
- `IUnitView`
- `IRatePlanView`
- `IRoomInventory`
- `IAccommodationLock`
- `IAccommodationBooking`

### 3) API Layer (`api/`)

Pure HTTP only.

- No component state.
- No navigation.
- No toast.
- No validation beyond request shape already provided by the caller.
- No transformation beyond minimal response extraction.

API inputs should be DTOs.
API outputs should be view types.

### 4) Hook Layer (`hooks/`)

Hooks own the use-case.

- Form hooks: create/update flows, validation, submit, navigation, toast.
- Data hooks: loading, error, pagination, refresh.
- Screen hooks: combine multiple API calls for one page.

Do not create one hook per endpoint.
Create one hook per screen or use-case.

## Recommended Hook Map

Traveller side:

- `usePublicAccommodationPropertyDetails(propertyId)`
- `useAccommodationLockFlow()`

Merchant side:

- `useAccommodationOnboarding()` for Add Property
- `useApartmentOnboarding()` for Add Apartment
- `useMerchantAccommodationManagement()` for the list page
- `useMerchantAccommodationDetails(propertyId)`
- `useMerchantAccommodationCalendar(propertyId)`
- `useMerchantAccommodationBookings(propertyId)`

## Page Responsibilities

Pages should only:

- read route params
- render hooks/components
- pass callbacks down

Pages should not:

- call `fetch`, `axios`, or domain API functions directly
- hold business logic that belongs in hooks
- convert request DTOs manually in the page body

## Current Pages

### `src/pages/Merchant/Accommodation/AddPropertyPage.tsx`

Should use `useAccommodationOnboarding()`.

The hook should own:

- step state
- draft state
- validation
- submit flow
- localStorage persistence
- navigation after create

### `src/pages/Merchant/Accommodation/AddApartmentPage.tsx`

Should use `useApartmentOnboarding()`.

The hook should own:

- apartment draft state
- derived unit mapping
- validation
- submit flow
- localStorage persistence

### `src/pages/Merchant/Accommodation/AccommodationManagement.tsx`

Should use `useMerchantAccommodationManagement()`.

The hook should own:

- pagination state
- fetch state
- refresh behavior
- URL/page synchronization if needed

### `src/pages/Merchant/Accommodation/AccommodationDetailsPage.tsx`

Should use `useMerchantAccommodationDetails(propertyId)`.

The hook should own:

- property fetch
- edit mode state
- edit draft state
- save handlers
- unit upsert behavior

### `src/pages/Merchant/Accommodation/AccommodationCalendarPage.tsx`

Should use `useMerchantAccommodationCalendar(propertyId)`.

The hook should own:

- property fetch
- inventory fetch
- selected unit state
- bulk update state
- slot actions

### `src/pages/Merchant/Accommodation/AccommodationBookingsPage.tsx`

Should use `useMerchantAccommodationBookings(propertyId)`.

The hook should own:

- locks/bookings state
- pagination state
- date filter state
- refresh behavior

### `src/pages/User/PropertyDetails/PropertyDetailsPage.tsx`

Should use traveller-facing accommodation hooks instead of calling domain APIs directly.

The hook should own:

- property loading
- selected unit/date state
- lock submission
- error mapping
- phone-verification / restriction side effects

## Data Flow

```text
Component
  -> Hook
  -> DTO validation
  -> API
  -> Backend

Backend
  -> API
  -> Hook processing
  -> Component
```

## Migration Priority

1. Keep `schemas/`, `types/`, `api/`, and `hooks/` as the only public domain layers.
2. Move screen logic out of pages into hooks.
3. Keep UI components presentational.
4. Re-export the public module surface from `src/features/Accommodation/index.ts`.
