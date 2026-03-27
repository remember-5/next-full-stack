export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";
export const GENERIC_AUTH_ERROR_MESSAGE =
  "Something went wrong. Please try again.";
export const INVALID_EMAIL_MESSAGE = "Please enter a valid email address.";
export const PASSWORD_TOO_SHORT_MESSAGE =
  "Password must be at least 8 characters long.";
export const PASSWORD_TOO_LONG_MESSAGE =
  "Password must be 128 characters or fewer.";
const DUPLICATE_EMAIL_MESSAGE = "An account already exists with that email.";
const SIGNUP_PASSWORD_MIN_LENGTH = 8;
const SIGNUP_PASSWORD_MAX_LENGTH = 128;

export type SignupValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

type SignupValidationResult =
  | {
      data: SignupPayload;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export function validateSignupValues(
  values: SignupValues
): SignupValidationResult {
  const name = values.name.trim();
  const email = values.email.trim();
  const password = values.password;
  const confirmPassword = values.confirmPassword;

  if (!name) {
    return {
      data: null,
      error: "Name is required.",
    };
  }

  if (!email) {
    return {
      data: null,
      error: "Email is required.",
    };
  }

  if (!password) {
    return {
      data: null,
      error: "Password is required.",
    };
  }

  if (!confirmPassword) {
    return {
      data: null,
      error: "Please confirm your password.",
    };
  }

  if (password.length < SIGNUP_PASSWORD_MIN_LENGTH) {
    return {
      data: null,
      error: PASSWORD_TOO_SHORT_MESSAGE,
    };
  }

  if (password.length > SIGNUP_PASSWORD_MAX_LENGTH) {
    return {
      data: null,
      error: PASSWORD_TOO_LONG_MESSAGE,
    };
  }

  if (password !== confirmPassword) {
    return {
      data: null,
      error: "Passwords do not match.",
    };
  }

  return {
    data: {
      name,
      email,
      password,
    },
    error: null,
  };
}

export function normalizeAuthErrorMessage(error: unknown): string {
  const candidates = collectAuthErrorCandidates(error);

  if (
    matchesCandidate(candidates, [
      "invalid_email_or_password",
      "invalid email or password",
      "invalid credentials",
    ])
  ) {
    return INVALID_CREDENTIALS_MESSAGE;
  }

  if (
    matchesCandidate(candidates, [
      "user_already_exists_use_another_email",
      "user already exists",
    ])
  ) {
    return DUPLICATE_EMAIL_MESSAGE;
  }

  if (matchesCandidate(candidates, ["invalid_email", "invalid email"])) {
    return INVALID_EMAIL_MESSAGE;
  }

  if (
    matchesCandidate(candidates, ["password_too_short", "password too short"])
  ) {
    return PASSWORD_TOO_SHORT_MESSAGE;
  }

  if (matchesCandidate(candidates, ["password_too_long", "password too long"])) {
    return PASSWORD_TOO_LONG_MESSAGE;
  }

  return GENERIC_AUTH_ERROR_MESSAGE;
}

function collectAuthErrorCandidates(error: unknown): string[] {
  const candidates = new Set<string>();

  addAuthErrorCandidate(candidates, error);

  if (error instanceof Error) {
    addAuthErrorCandidate(candidates, error.message);
    addAuthErrorCandidate(
      candidates,
      (error as Error & { cause?: unknown }).cause
    );
  }

  if (!isRecord(error)) {
    return [...candidates];
  }

  addAuthErrorCandidate(candidates, error.code);
  addAuthErrorCandidate(candidates, error.message);
  addAuthErrorCandidate(candidates, error.statusText);
  addAuthErrorCandidate(candidates, error.error);
  addAuthErrorCandidate(candidates, error.cause);

  if (isRecord(error.error)) {
    addAuthErrorCandidate(candidates, error.error.code);
    addAuthErrorCandidate(candidates, error.error.message);
    addAuthErrorCandidate(candidates, error.error.statusText);
  }

  if (isRecord(error.cause)) {
    addAuthErrorCandidate(candidates, error.cause.code);
    addAuthErrorCandidate(candidates, error.cause.message);
    addAuthErrorCandidate(candidates, error.cause.statusText);
  }

  return [...candidates];
}

function addAuthErrorCandidate(candidates: Set<string>, value: unknown) {
  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue) {
      candidates.add(normalizedValue);
    }

    return;
  }

  if (value instanceof Error) {
    addAuthErrorCandidate(candidates, value.message);
    addAuthErrorCandidate(candidates, (value as Error & { cause?: unknown }).cause);
  }
}

function matchesCandidate(candidates: string[], fragments: string[]) {
  return candidates.some((candidate) =>
    fragments.some((fragment) => candidate.includes(fragment))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
