import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type RegisterProps = {
	onRegister: (email: string) => void
}

const Register = ({ onRegister }: RegisterProps) => {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [workspace, setWorkspace] = useState('')
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState('')
	const navigate = useNavigate()

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		onRegister(email)
		setMessage(`Workspace ${workspace || 'your team'} created for ${name}.`)
		navigate('/dashboard')
	}

	return (
		<main className="auth">
			<section>
				<h1>Create your workspace</h1>
				<p>Set up your space and invite your team in minutes.</p>
				<form onSubmit={handleSubmit} className="auth-form">
					<label>
						Full name
						<input
							type="text"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="Alex Johnson"
							required
						/>
					</label>
					<label>
						Work email
						<input
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="you@company.com"
							required
						/>
					</label>
					<label>
						Password
						<input
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							placeholder="At least 8 characters"
							minLength={8}
							required
						/>
					</label>
					<label>
						Workspace name
						<input
							type="text"
							value={workspace}
							onChange={(event) => setWorkspace(event.target.value)}
							placeholder="Marketing HQ"
							required
						/>
					</label>
					<button type="submit">Create account</button>
				</form>
				{message ? <p role="status">{message}</p> : null}
				<p>
					Already have an account? <Link to="/login">Log in</Link>.
				</p>
			</section>
		</main>
	)
}

export default Register
