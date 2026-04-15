import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CheckoutPage from './CheckoutPage';

const mockPayWithMpesa = vi.fn();
const mockCheckout = vi.fn();
const mockFetchOrders = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: 'smoke-user',
      email: 'smoke@example.com',
      phoneNumber: '254712345678',
    },
  }),
}));

vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    items: [
      {
        productId: 1,
        name: 'Controller',
        price: 1000,
        quantity: 1,
        variant: {},
      },
    ],
    subtotal: 1000,
    totalItems: 1,
    updateQuantity: vi.fn(),
    removeFromCart: vi.fn(),
    checkout: mockCheckout,
    payWithMpesa: mockPayWithMpesa,
    confirmPayment: vi.fn(),
    itemSignature: () => '1::::',
    syncError: '',
  }),
}));

vi.mock('../services/api', () => ({
  fetchOrders: (...args) => mockFetchOrders(...args),
  retryOrderPayment: vi.fn(),
}));

vi.mock('../config/env', () => ({
  FLUTTERWAVE_PUBLIC_KEY: '',
}));

vi.mock('flutterwave-react-v3', () => ({
  useFlutterwave: () => vi.fn(),
  closePaymentModal: vi.fn(),
}));

describe('CheckoutPage smoke test', () => {
  beforeEach(() => {
    mockPayWithMpesa.mockReset();
    mockCheckout.mockReset();
    mockFetchOrders.mockReset();
    mockFetchOrders.mockResolvedValue({ orders: [] });
    mockPayWithMpesa.mockResolvedValue({
      provider: 'daraja',
      message: 'Check your phone to complete the M-Pesa payment.',
      order: {
        id: 10,
        status: 'pending',
        payment_method: 'mpesa',
        payment_reference: 'DARAJA-REF-1',
      },
    });
  });

  test('submits the dedicated M-Pesa flow instead of the generic checkout flow', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockFetchOrders).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('button', { name: /pay with m-pesa/i }));

    await waitFor(() => {
      expect(mockPayWithMpesa).toHaveBeenCalledWith({
        phoneNumber: '254712345678',
        customerName: 'smoke-user',
        customerEmail: 'smoke@example.com',
      });
    });

    expect(mockCheckout).not.toHaveBeenCalled();
    expect(await screen.findByText(/check your phone to complete the m-pesa payment/i)).toBeInTheDocument();
  });
});
