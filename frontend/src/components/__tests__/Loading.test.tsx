import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loading from "../Loading";

describe("Loading", () => {
  it("renders spinner element", () => {
    const { container } = render(<Loading />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });
});
