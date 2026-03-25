import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type LoginProps = {
	onLogin: (email: string) => void
}

const Login = ({ onLogin }: LoginProps) => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState('')
	const navigate = useNavigate()

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		onLogin(email)
		setMessage(`Welcome back, ${email || 'team member'}!`)
		navigate('/dashboard')
	}

	return (
		<main className="auth">
			<section>
				<h1>Welcome back</h1>
				<p>Log in to keep up with your team updates.</p>
				<form onSubmit={handleSubmit} className="auth-form">
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
							placeholder="••••••••"
							required
						/>
					</label>
					<button type="submit">Log in</button>
				</form>
				{message ? <p role="status">{message}</p> : null}
				<p>
					New here? <Link to="/register">Create an account</Link>.
				</p>
			</section>
		</main>
	)
}

export default Login
