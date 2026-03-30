import { expect, test } from "vitest";

import {
  normalizeAuthErrorMessage,
  PASSWORD_TOO_LONG_MESSAGE,
  PASSWORD_TOO_SHORT_MESSAGE,
  validateSignupValues,
} from "./forms";

test("mismatched passwords are rejected with the expected message", () => {
  const result = validateSignupValues({
    name: "Test User",
    email: "user@example.com",
    password: "password123",
    confirmPassword: "password456",
  });

  expect(result.error).toBe("Passwords do not match.");
  expect(result.data).toBeNull();
});

test("values are trimmed and parsed into the signup payload", () => {
  const result = validateSignupValues({
    name: "  Test User  ",
    email: "  user@example.com  ",
    password: "password123",
    confirmPassword: "password123",
  });

  expect(result).toEqual({
    data: {
      name: "Test User",
      email: "user@example.com",
      password: "password123",
    },
    error: null,
  });
});

test("signup validation requires a name", () => {
  const result = validateSignupValues({
    name: "   ",
    email: "user@example.com",
    password: "password123",
    confirmPassword: "password123",
  });

  expect(result.error).toBe("Name is required.");
  expect(result.data).toBeNull();
});

test("signup validation requires an email", () => {
  const result = validateSignupValues({
    name: "Test User",
    email: "   ",
    password: "password123",
    confirmPassword: "password123",
  });

  expect(result.error).toBe("Email is required.");
  expect(result.data).toBeNull();
});

test("signup validation requires a password", () => {
  const result = validateSignupValues({
    name: "Test User",
    email: "user@example.com",
    password: "",
    confirmPassword: "",
  });

  expect(result.error).toBe("Password is required.");
  expect(result.data).toBeNull();
});

test("signup validation requires a password confirmation", () => {
  const result = validateSignupValues({
    name: "Test User",
    email: "user@example.com",
    password: "password123",
    confirmPassword: "",
  });

  expect(result.error).toBe("Please confirm your password.");
  expect(result.data).toBeNull();
});

test("signup validation rejects passwords shorter than the UI rule", () => {
  const result = validateSignupValues({
    name: "Test User",
    email: "user@example.com",
    password: "short",
    confirmPassword: "short",
  });

  expect(result.error).toBe(PASSWORD_TOO_SHORT_MESSAGE);
  expect(result.data).toBeNull();
});

test("signup validation rejects passwords longer than the allowed maximum", () => {
  const result = validateSignupValues({
    name: "Test User",
    email: "user@example.com",
    password: "a".repeat(129),
    confirmPassword: "a".repeat(129),
  });

  expect(result.error).toBe(PASSWORD_TOO_LONG_MESSAGE);
  expect(result.data).toBeNull();
});

test("auth error normalization maps invalid credentials to the UI message", () => {
  const message = normalizeAuthErrorMessage({
    error: {
      code: "INVALID_EMAIL_OR_PASSWORD",
    },
  });

  expect(message).toBe("Invalid email or password.");
});

test("auth error normalization maps duplicate signup emails to the UI message", () => {
  const message = normalizeAuthErrorMessage({
    error: {
      code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
    },
  });

  expect(message).toBe("An account already exists with that email.");
});

test("auth error normalization maps invalid signup emails to the UI message", () => {
  const message = normalizeAuthErrorMessage({
    error: {
      code: "INVALID_EMAIL",
    },
  });

  expect(message).toBe("Please enter a valid email address.");
});

test("auth error normalization maps short signup passwords to the UI message", () => {
  const message = normalizeAuthErrorMessage({
    error: {
      code: "PASSWORD_TOO_SHORT",
    },
  });

  expect(message).toBe(PASSWORD_TOO_SHORT_MESSAGE);
});

test("auth error normalization maps long signup passwords to the UI message", () => {
  const message = normalizeAuthErrorMessage({
    error: {
      message: "Password too long",
    },
  });

  expect(message).toBe(PASSWORD_TOO_LONG_MESSAGE);
});

test("auth error normalization falls back to the generic message", () => {
  const message = normalizeAuthErrorMessage({
    error: {
      code: "SOMETHING_ELSE",
    },
  });

  expect(message).toBe("Something went wrong. Please try again.");
});
