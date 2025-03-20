module.exports = {
  STATUS_CODE: {
    OK: 200,
    TRIPLEA: 151,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    INFO: 250,
    NON_AUTHORITATIVE: 203,
    BAD_REQUEST: 400,
    UN_AUTHORIZED: 401,
    FORBIDDEN: 403,
    RESOURCE_NOT_FOUND: 404,
    PROXY_AUTH_FAILED: 412,
    TOO_MANY_REQUESTS: 429,
    VALIDATION_FAILURE: 450,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    SERVER_TIMEOUT: 504,
  },

  ERROR_MSGS: {
    INTERNAL_SERVER_ERROR:
      "An unexpected error occurred. Please try again later.",
    ACCOUNT_EXISTS: "This account already exists. Please log in instead.",
    ACCOUNT_NOT_EXISTS: "This email address does not exist. Please sign up.",
    WENT_WRONG: "Oops! Something went wrong. Please try again.",
    INVALID_LOGIN: "The email or password provided is invalid.",
    UPDATE_ERR: "We were unable to update the data. Please try again.",
    CREATE_ERR: "Failed to create the requested data. Please try again.",
    DELETE_ERR: "Unable to delete the specified data. Please try again.",
    INVALID_ID: "The provided User ID is invalid.",
    ALREADY_REMOVED: "This item has already been removed.",
    INVALID_TOKEN_FORMAT: "The token format is invalid.",
    TOKEN_MISSING: "Authorization is required.",
    EXPIRED_OTP: "Your OTP has expired. Please request a new one.",
    UN_AUTHORIZED: "You are not authorized to access this resource.",
    TOKEN_SESSION_EXPIRED: "Your session has expired. Please log in again.",
    INVALID_TOKEN: "The token is either invalid or expired.",
    INVALID_TOKEN_TYPE: "The token type is invalid.",
    DATA_NOT_FOUND: "Requested data could not be found.",
    DATA_NOT_AVAILABLE: "The requested data is currently unavailable.",
    ACCOUNT_NOT_FOUND: "The account could not be found. Please register first.",
    PERMISSIONS_DENIED:
      "Access denied. This action is restricted to administrators only.",
    ADMIN_ACCESS_DENIED: "Access denied. Only administrators can log in.",
    FAVORITE_ALREADY_EXISTS: "This item is already marked as a favorite.",
    OPERATOR_MOB_NUM_EXISTS: "This phone number already exists in operator.",
    CARRIER_MOB_NUM_EXISTS: "This phone number already exists in carrier.",
    DATA_EXISTS: "already exists.",
    KEY_REQUIRED: "is required.",
    INVALID_OTP: "The provided OTP is invalid.",
    NOT_FOUND: "is not found",
    NOT_EDITABLE: "cannot be edited.",
    BAD_REQUEST: "Bad request.",
    INVALID_TYPE: "type is invalid.",
    INVALID_EMAIL_OR_MOBILE: "The email or mobile number provided is invalid.",
    FILES_EMPTY: "No files were provided in the request.",
    BODY_EMPTY: "The request body cannot be empty.",
    INSUFFICIENT_PERMISSION:
      "You do not have sufficient permissions to perform this action.",
    NO_ACCESS_TOKEN:
      "An authentication token is missing from the request header.",
    AUTHORIZATION_FAILED: "Authorization failed. Please try again.",
    AUTHORIZATION_FAILED_LOGIN_AGAIN:
      "Authorization failed. Please log in again.",
    INVALID_SORTBY: "The sortBy parameter is invalid.",
    INVALID_ROLE: "The specified role value is invalid.",
    ALREADY_ASSIGN: "This movement has already been assigned to another user.",
    UNSUPPORTED_FILE: "The provided file type is not supported.",
    FORGOT_PASSWORD_TOKEN_EXPIRED:
      "The password reset token has expired. Please initiate the process again.",
    ENVIRONMENT_VAR_MISSING: "Required environment variables are missing.",
    ACCESS_RESTRICTED_ADMIN:
      "Access denied. Your account has been restricted by the administrator.",
    EMAIL_EXIST:
      "This email is already registered. Please use a different one.",
    ACCESS_TOKEN_REQUIRED:
      "A valid access token is required; a refresh token was provided instead.",
    MISSING_ORDERID:
      "The orderId is missing. Please ensure the user has completed the approval process.",
    USER_REFERENCE_EXIST:
      "The user reference has already been used. Please provide a unique reference.",
    USER_REFERENCE_LIMIT:
      "The user reference must be exactly 10 characters long.",
    CARRIER_REFERENCE_EXIST:
      "The carrier reference has already been used. Please provide a unique reference.",
    CARRIER_REFERENCE_LIMIT:
      "The carrier reference must be exactly 10 characters long.",
    REFERENCE_LIMIT:
      "You can only add up to 2 commercial references.",
  },

  INFO_MSGS: {
    CREATED_SUCCESSFULLY: "The data was created successfully.",
    ADDED_SUCCESSFULLY: "The data was added successfully.",
    UPDATED_SUCCESSFULLY: "The data was updated successfully.",
    DELETED_SUCCESSFULLY: "The data was deleted successfully.",
    UPLOADED_SUCCESSFULLY: "The data was uploaded successfully.",
    VERIFY_SUCCESSFULLY: "verification successfully.",
    UNVERIFY_SUCCESSFULLY: "unverification successfully.",
    LOGOUT_SUCCESSFULLY: "You have successfully logged out.",
    SUCCESSFUL_LOGIN: "You have logged in successfully.",
    SUCCESS: "The request was processed successfully.",
    OTP_VERIFIED: "The OTP has been verified successfully.",
    PASSWORD_CHANGED: "Your password has been changed successfully.",
    SEND_USER_TO_CARRIER_REQUEST:
      "Your request has been sent to the carrier for approval. Please wait for their response.",
    SUCCESSFUL_REGISTER: "Your registration with Cargo Connect was successful.",
    OTP_SENT_SUCC:
      "An OTP has been sent to your email address. Please check your inbox and use the OTP to proceed.",
    OTP_SENT_IN_MOBILE_SUCC:
      "An OTP has been sent to your mobile number. Please check your messages and use the OTP to proceed.",
  },
};
