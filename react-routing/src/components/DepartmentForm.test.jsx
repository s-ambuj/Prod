import { screen, render, fireEvent } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import DepartmentForm from './DepartmentForm'

describe ('Description of DepartmentForm', () => {
    test("renders department form", () => {
        render(<DepartmentForm />)
        expect(screen.getByLabelText(/department name/i)).toBeInTheDocument()
    })

    test("updates input field on change", () => {
        render(<DepartmentForm />)
        const departmentInput = screen.getByLabelText(/department name/i)
        fireEvent.change(departmentInput, { target: { value: 'HR' } })
        expect(departmentInput.value).toBe('HR')
    })
})