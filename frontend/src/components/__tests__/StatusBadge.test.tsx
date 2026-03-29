import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatusBadge from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders the status text", () => {
    render(<StatusBadge status="Ongoing" />);
    expect(screen.getByText("Ongoing")).toBeInTheDocument();
  });

  it("applies correct color class for Upcoming", () => {
    const { container } = render(<StatusBadge status="Upcoming" />);
    expect(container.firstChild).toHaveClass("bg-blue-100");
  });

  it("applies correct color class for Finished", () => {
    const { container } = render(<StatusBadge status="Finished" />);
    expect(container.firstChild).toHaveClass("bg-gray-100");
  });

  it("handles unknown status gracefully", () => {
    render(<StatusBadge status="Unknown" />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});
