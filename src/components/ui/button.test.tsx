import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Save changes</Button>);

    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="secondary" size="sm">
        Small secondary
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Small secondary" })).toHaveClass(
      "bg-secondary",
      "h-8",
    );
  });

  it("disables the button and exposes busy state while loading", () => {
    render(<Button isLoading>Submitting</Button>);

    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status", { name: "Loading" })).toBeVisible();
  });
});
