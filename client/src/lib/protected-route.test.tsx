import React from "react";
import { render, screen } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./protected-route";

// Mock modules
jest.mock("@/hooks/use-auth");
jest.mock("wouter", () => {
  const React = require("react");
  return {
    Route: ({ children }: { children: React.ReactNode }) => 
      React.createElement(React.Fragment, null, children),
    Redirect: () => 
      React.createElement("div", { "data-testid": "mock-redirect" }, "Redirected to /auth"),
  };
});

// Mock component to be rendered when authenticated
const MockComponent = () => {
  return (
    <div data-testid="protected-content">Protected Content</div>
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show loading state", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: true,
    });

    render(
      <ProtectedRoute path="/test" component={MockComponent} />
    );

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("should redirect to auth page when user is not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(
      <ProtectedRoute path="/test" component={MockComponent} />
    );

    expect(screen.getByTestId("mock-redirect")).toBeInTheDocument();
  });

  it("should render protected component when user is authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, username: "testuser" },
      isLoading: false,
    });

    render(
      <ProtectedRoute path="/test" component={MockComponent} />
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });
});