import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Sidebar, SidebarProvider, SidebarTrigger } from '../sidebar';

describe('Sidebar Component', () => {
  it('renders in expanded state by default', () => {
    render(
      <SidebarProvider>
        <Sidebar data-testid="sidebar">Sidebar Content</Sidebar>
      </SidebarProvider>
    );
    
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar.closest('[data-state]')).toHaveAttribute('data-state', 'expanded');
  });

  it('toggles state when trigger is clicked', () => {
    render(
      <SidebarProvider>
        <div>
          <Sidebar data-testid="sidebar">Sidebar Content</Sidebar>
          <SidebarTrigger data-testid="trigger" />
        </div>
      </SidebarProvider>
    );

    const trigger = screen.getByTestId('trigger');
    const sidebar = screen.getByTestId('sidebar');
    
    // Initial state
    expect(sidebar.closest('[data-state]')).toHaveAttribute('data-state', 'expanded');
    
    // Click trigger
    fireEvent.click(trigger);
    expect(sidebar.closest('[data-state]')).toHaveAttribute('data-state', 'collapsed');
  });

  it('maintains state across multiple toggles', () => {
    render(
      <SidebarProvider>
        <div>
          <Sidebar data-testid="sidebar">Sidebar Content</Sidebar>
          <SidebarTrigger data-testid="trigger" />
        </div>
      </SidebarProvider>
    );

    const trigger = screen.getByTestId('trigger');
    const sidebar = screen.getByTestId('sidebar');
    
    // Initial state
    expect(sidebar.closest('[data-state]')).toHaveAttribute('data-state', 'expanded');
    
    // First toggle
    fireEvent.click(trigger);
    expect(sidebar.closest('[data-state]')).toHaveAttribute('data-state', 'collapsed');
    
    // Second toggle
    fireEvent.click(trigger);
    expect(sidebar.closest('[data-state]')).toHaveAttribute('data-state', 'expanded');
  });

  it('handles keyboard shortcut', () => {
    render(
      <SidebarProvider>
        <Sidebar data-testid="sidebar">Sidebar Content</Sidebar>
      </SidebarProvider>
    );

    const sidebar = screen.getByTestId('sidebar');
    
    // Initial state
    expect(sidebar.closest('[data-state]')).toHaveAttribute('data-state', 'expanded');
    
    // Simulate keyboard shortcut (Ctrl/Cmd + b)
    fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
    expect(sidebar.closest('[data-state]')).toHaveAttribute('data-state', 'collapsed');
  });
});
