import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppText } from "./AppText";

describe("AppText", () => {
  it("renders children", () => {
    render(<AppText>Hello world</AppText>);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders default element as p for body variant", () => {
    render(<AppText variant="body">Body text</AppText>);
    const el = screen.getByText("Body text");
    expect(el.tagName).toBe("P");
  });

  it("renders h1 element for h1 variant", () => {
    render(<AppText variant="h1">Heading</AppText>);
    expect(screen.getByText("Heading").tagName).toBe("H1");
  });

  it("renders h2 element for h2 variant", () => {
    render(<AppText variant="h2">H2 text</AppText>);
    expect(screen.getByText("H2 text").tagName).toBe("H2");
  });

  it("renders label element for label variant", () => {
    render(<AppText variant="label">Label</AppText>);
    expect(screen.getByText("Label").tagName).toBe("LABEL");
  });

  it("allows custom `as` prop to override element", () => {
    render(<AppText as="span">Span text</AppText>);
    expect(screen.getByText("Span text").tagName).toBe("SPAN");
  });

  it("applies truncate class when truncate is true", () => {
    render(<AppText truncate>Truncated</AppText>);
    expect(screen.getByText("Truncated").className).toContain("truncate");
  });

  it("applies color variant class", () => {
    render(<AppText color="muted">Muted</AppText>);
    expect(screen.getByText("Muted").className).toContain("text-muted-foreground");
  });

  it("applies weight class", () => {
    render(<AppText weight="bold">Bold</AppText>);
    expect(screen.getByText("Bold").className).toContain("font-bold");
  });

  it("applies align class", () => {
    render(<AppText align="center">Centered</AppText>);
    expect(screen.getByText("Centered").className).toContain("text-center");
  });
});
