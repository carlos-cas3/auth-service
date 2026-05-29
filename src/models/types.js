/** Enum of possible user account statuses. */
const USER_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
};

/** Enum of available role names in the system. */
const ROLE_NAME = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  VENDOR_ADMIN: 'VENDOR_ADMIN'
};

/** Map of semantic status names to HTTP status codes used across the service. */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

module.exports = { USER_STATUS, ROLE_NAME, HTTP_STATUS };