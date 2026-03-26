import { screen, render, fireEvent } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import LoginForm from './LoginForm'

describe ('LoginForm', () => {
    test("renders login form", () => {
        render(<LoginForm />)
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    test("updates input fields on change", () => {
        render(<LoginForm />)
        const usernameInput = screen.getByLabelText(/username/i)
        const passwordInput = screen.getByLabelText(/password/i)
        fireEvent.change(usernameInput, { target: { value: 'testuser' } })
        fireEvent.change(passwordInput, { target: { value: 'testpass' } })
        expect(usernameInput.value).toBe('testuser')
        expect(passwordInput.value).toBe('testpass')
    })
})
