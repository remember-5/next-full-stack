import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Checkbox } from "@/components/ui/checkbox";

function CheckboxHarness({ disabled = false }: { disabled?: boolean }) {
  const [checked, setChecked] = React.useState(false);

  return (
    <label>
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(nextChecked) => setChecked(nextChecked === true)}
      />
      Accept terms
    </label>
  );
}

describe("Checkbox", () => {
  it("toggles its checked state when clicked", async () => {
    const user = userEvent.setup();

    render(<CheckboxHarness />);

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });

    expect(checkbox).toHaveAttribute("data-state", "unchecked");

    await user.click(checkbox);

    expect(checkbox).toHaveAttribute("data-state", "checked");

    await user.click(checkbox);

    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });

  it("does not change state when disabled", async () => {
    const user = userEvent.setup();

    render(<CheckboxHarness disabled />);

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });

    expect(checkbox).toBeDisabled();

    await user.click(checkbox);

    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });
});
