/**
 * Enumeration for common HTTP status codes.
 *
 * @enum {number}
 */
export enum HttpCodes {
  /**
   * HTTP 200 OK success status response code indicates that the request has succeeded.
   */
  Ok = 200,

  /**
   * HTTP 201 Created success status response code indicates that the request has succeeded and has led to the creation of a resource.
   */
  Created = 201,

  /**
   * HTTP 204 No Content success status response code indicates that the request has succeeded, but that the client doesn't need to navigate away from its current page.
   */
  NoContent = 204,

  /**
   * HTTP 400 Bad Request response code indicates that the server could not understand the request due to invalid syntax.
   */
  BadRequest = 400,

  /**
   * HTTP 401 Unauthorized response code indicates that the request has not been applied because it lacks valid authentication credentials for the target resource.
   */
  Unauthorized = 401,

  /**
   * HTTP 404 Not Found response code indicates that the server cannot find the requested resource.
   */
  NotFound = 404,

  /**
   * HTTP 422 Unprocessable Entity response code indicates that the server understands the content type of the request entity, and the syntax of the request entity is correct but it was unable to process the contained instructions.
   */
  UnprocessableEntity = 422,

  /**
   * HTTP 500 Internal Server Error response code indicates that the server has encountered a situation it doesn't know how to handle.
   */
  InternalServerError = 500,

  /**
   * HTTP 503 Service Unavailable response code indicates that the server is not ready to handle the request.
   */
  ServiceUnavailable = 503,
}

/**
 * Enumeration for high-level HTTP operation results.
 *
 * @enum {string}
 */
export enum HttpStatus {
  /**
   * Selector for successful HTTP operation.
   */
  Success = 'success',

  /**
   * Selector for HTTP operation.
   */
  Failed = 'failed',
}

/**
 * Enumeration for standard HTTP response messages.
 *
 * @enum {string}
 */
export enum HttpMessages {
  /**
   * Response message for an invalid API key.
   */
  InvalidApiKey = 'Invalid API key',

  /**
   * Response message for failed authorization attempts.
   */
  AuthorizationFailed = 'Failed to authorize endpoint',

  /**
   * Standard OK response message.
   */
  MessageOk = 'OK',
}

/**
 * Type representing the errors during input verification.
 *
 * @interface
 * @property {string} [key: string] - Stores verification errors, with keys representing field names and values as error messages.
 */
export interface VerificationErrorModel {
  [key: string]: string;
}
