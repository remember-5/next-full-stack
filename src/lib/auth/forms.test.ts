import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeAuthErrorMessage,
  PASSWORD_TOO_LONG_MESSAGE,
  PASSWORD_TOO_SHORT_MESSAGE,
  validateSignupValues,
} from "./forms";

void test("mismatched passwords are rejected with the expected message", () => {
  const result = validateSignupValues({
    name: "Test User",
    email: "user@example.com",
    password: "password123",
    confirmPassword: "password456",
  });

  assert.equal(result.error, "Passwords do not match.");
  assert.equal(result.data, null);
});

void test("values are trimmed and parsed into the signup payload", () => {
  const result = validateSignupValues({
    name: "  Test User  ",
    email: "  user@example.com  ",
    password: "password123",
    confirmPassword: "password123",
  });

  assert.deepEqual(result, {
    data: {
      name: "Test User",
      email: "user@example.com",
      password: "password123",
    },
    error: null,
  });
});

void test("signup validation requires a name", () => {
  const result = validateSignupValues({
    name: "   ",
    email: "user@example.com",
    password: "password123",
    confirmPassword: "password123",
  });

  assert.equal(result.error, "Name is required.");
  assert.equal(result.data, null);
});

void test("signup validation requires an email", () => {
  const result = validateSignupValues({
    name: "Test User",
    email: "   ",
    password: "password123",
    confirmPassword: "password123",
  });

  assert.equal(result.error, "Email is required.");
  assert.equal(result.data, null);
});

void test("signup validation requires a password", () => {
  const result = validateSignupValues({
    name: "Test User",
    email: "user@example.com",
    password: "",
    confirmPassword: "",
  });

  assert.equal(result.error, "Password is required.");
  assert.equal(result.data, null);
});

void test("signup validation requires a password confirmation", () => {
  const result = validateSignupValues({
    name: "Test User",
    email: "user@example.com",
    password: "password123",
    confirmPassword: "",
  });

  assert.equal(result.error, "Please confirm your password.");
  assert.equal(result.data, null);
});

void test("signup validation rejects passwords shorter than the UI rule", () => {
  const result = validateSignupValues({
    name: "Test User",
    email: "user@example.com",
    password: "short",
    confirmPassword: "short",
  });

  assert.equal(result.error, PASSWORD_TOO_SHORT_MESSAGE);
  assert.equal(result.data, null);
});

void test("signup validation rejects passwords longer than the allowed maximum", () => {
  const result = validateSignupValues({
    name: "Test User",
    email: "user@example.com",
    password: "a".repeat(129),
    confirmPassword: "a".repeat(129),
  });

  assert.equal(result.error, PASSWORD_TOO_LONG_MESSAGE);
  assert.equal(result.data, null);
});

void test("auth error normalization maps invalid credentials to the UI message", () => {
  const message = normalizeAuthErrorMessage({
    error: {
      code: "INVALID_EMAIL_OR_PASSWORD",
    },
  });

  assert.equal(message, "Invalid email or password.");
});

void test("auth error normalization maps duplicate signup emails to the UI message", () => {
  const message = normalizeAuthErrorMessage({
    error: {
      code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
    },
  });

  assert.equal(message, "An account already exists with that email.");
});

void test("auth error normalization maps invalid signup emails to the UI message", () => {
  const message = normalizeAuthErrorMessage({
    error: {
      code: "INVALID_EMAIL",
    },
  });

  assert.equal(message, "Please enter a valid email address.");
});

void test("auth error normalization maps short signup passwords to the UI message", () => {
  const message = normalizeAuthErrorMessage({
    error: {
      code: "PASSWORD_TOO_SHORT",
    },
  });

  assert.equal(message, PASSWORD_TOO_SHORT_MESSAGE);
});

void test("auth error normalization maps long signup passwords to the UI message", () => {
  const message = normalizeAuthErrorMessage({
    error: {
      message: "Password too long",
    },
  });

  assert.equal(message, PASSWORD_TOO_LONG_MESSAGE);
});

void test("auth error normalization falls back to the generic message", () => {
  const message = normalizeAuthErrorMessage({
    error: {
      code: "SOMETHING_ELSE",
    },
  });

  assert.equal(message, "Something went wrong. Please try again.");
});
