import { BaseException } from "./base.exception";

// ─── AUTH / USER EXCEPTIONS ───

export class SuspendedAccountException extends BaseException {
  constructor(message = "Your account is suspended. Contact admin for assistance.") {
    super("SUSPENDED_ACCOUNT", message, 403);
  }
}

// ─── LOCK / BOOKING LIMITS ───

export class DailyLockLimitExceededException extends BaseException {
  constructor(message = "You have reached the daily limit of active locks.") {
    super("DAILY_LOCK_LIMIT_EXCEEDED", message, 429);
  }
}

export class SelfLockRestrictedException extends BaseException {
  constructor(message = "You cannot lock your own deal or property.") {
    super("SELF_LOCK_RESTRICTED", message, 403);
  }
}

export class SelfBookingRestrictedException extends BaseException {
  constructor(message = "You cannot book your own deal or property.") {
    super("SELF_BOOKING_RESTRICTED", message, 403);
  }
}

export class LocalDealRestrictedException extends BaseException {
  constructor(message = "This deal is restricted to local residents. A Maldives phone number (+960) is required.") {
    super("LOCAL_DEAL_RESTRICTED", message, 403);
  }
}

// ─── INVENTORY / STATUS EXCEPTIONS ───

export class VariantInactiveException extends BaseException {
  constructor(message = "This deal variant is no longer active.") {
    super("VARIANT_INACTIVE", message, 400);
  }
}

export class PropertyInactiveException extends BaseException {
  constructor(message = "This property is no longer active.") {
    super("PROPERTY_INACTIVE", message, 400);
  }
}

export class DealExpiredException extends BaseException {
  constructor(message = "This date has already passed. Please refresh the page to see current availability.") {
    super("DEAL_EXPIRED", message, 410);
  }
}

export class InsufficientSlotsException extends BaseException {
  constructor(message = "Not enough slots available.") {
    super("INSUFFICIENT_SLOTS", message, 400);
  }
}

export class RoomsNotAvailableException extends BaseException {
  constructor(message = "The selected rooms are no longer available for these dates.") {
    super("ROOMS_NOT_AVAILABLE", message, 400);
  }
}

export class LockInactiveException extends BaseException {
  constructor(message = "Lock is no longer active.") {
    super("LOCK_INACTIVE", message, 400);
  }
}

export class LockExpiredException extends BaseException {
  constructor(message = "Lock has expired.") {
    super("LOCK_EXPIRED", message, 410);
  }
}

export class InvalidDatesException extends BaseException {
  constructor(message = "Invalid date format or range provided.") {
    super("INVALID_DATES", message, 400);
  }
}

export class InvalidAddonsException extends BaseException {
  constructor(message = "One or more selected add-ons are invalid for this deal.") {
    super("INVALID_ADDONS", message, 400);
  }
}

export class InternalProcessingException extends BaseException {
  constructor(message = "An internal error occurred while processing your request. Please try again.") {
    super("INTERNAL_PROCESSING_ERROR", message, 500);
  }
}
