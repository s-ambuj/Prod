import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const TestComponent = () => {
  const { user } = useAuth();
  return <div>{user ? `User: ${user.name}` : 'No User'}</div>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders auth provider without crashing', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText(/No User|User:/)).toBeInTheDocument();
  });
});
