import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "~/components/login-form";
import { INVALID_CREDENTIALS_MESSAGE } from "~/lib/auth/forms";

const { refreshMock, replaceMock, signInEmailMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  replaceMock: vi.fn(),
  signInEmailMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
    replace: replaceMock,
  }),
}));

vi.mock("~/server/better-auth/client", () => ({
  authClient: {
    signIn: {
      email: signInEmailMock,
    },
  },
}));

function fillCredentials() {
  return {
    email: screen.getByLabelText("Email"),
    password: screen.getByLabelText("Password"),
    submit: screen.getByRole("button", { name: "Login" }),
  };
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });

  return { promise, reject, resolve };
}

describe("LoginForm", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    replaceMock.mockReset();
    signInEmailMock.mockReset();
  });

  it("submits credentials and redirects to the next path after a successful login", async () => {
    const user = userEvent.setup();
    signInEmailMock.mockResolvedValueOnce(undefined);

    render(<LoginForm nextPath="/admin/menu" />);

    const { email, password, submit } = fillCredentials();
    await user.type(email, "admin@example.com");
    await user.type(password, "change-me-now");
    await user.click(submit);

    await waitFor(() =>
      expect(signInEmailMock).toHaveBeenCalledWith({
        email: "admin@example.com",
        fetchOptions: {
          throw: true,
        },
        password: "change-me-now",
      }),
    );
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/admin/menu"));
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("shows a normalized auth error when login fails", async () => {
    const user = userEvent.setup();
    signInEmailMock.mockRejectedValueOnce({
      code: "invalid_email_or_password",
    });

    render(<LoginForm />);

    const { email, password, submit } = fillCredentials();
    await user.type(email, "admin@example.com");
    await user.type(password, "wrong-password");
    await user.click(submit);

    expect(
      await screen.findByText(INVALID_CREDENTIALS_MESSAGE),
    ).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("disables the submit button while the request is pending", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<void>();
    signInEmailMock.mockReturnValueOnce(deferred.promise);

    render(<LoginForm />);

    const { email, password, submit } = fillCredentials();
    await user.type(email, "admin@example.com");
    await user.type(password, "change-me-now");
    await user.click(submit);

    expect(screen.getByRole("button", { name: "Logging in..." })).toBeDisabled();

    deferred.resolve();

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/dashboard"));
  });
});
