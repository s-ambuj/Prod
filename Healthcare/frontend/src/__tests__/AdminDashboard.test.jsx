import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard';

vi.mock('../services/api', () => ({
  adminAPI: {
    getAllUsers: vi.fn(() => Promise.resolve({ data: [] })),
    getPendingDoctors: vi.fn(() => Promise.resolve({ data: [] })),
    getReports: vi.fn(() => Promise.resolve({
      data: {
        users: { total: 0, patients: 0, doctors: 0, admins: 0, pending_doctors: 0 },
        appointments: { total: 0, booked: 0, completed: 0, cancelled: 0 },
        prescriptions: { total: 0 }
      }
    })),
  }
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Admin User', role: 'admin' } }),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }) => <div>{children}</div>,
    button: ({ children }) => <button>{children}</button>,
  },
}));

describe('AdminDashboard Component', () => {
  it('renders dashboard', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });
});
