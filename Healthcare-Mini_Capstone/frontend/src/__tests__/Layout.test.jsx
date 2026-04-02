import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Test User', role: 'patient' }, logout: vi.fn() }),
}));

describe('Layout Component', () => {
  it('renders layout with content', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders Medconnect header', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </BrowserRouter>
    );
    expect(screen.getByText('Medconnect')).toBeInTheDocument();
  });
});
