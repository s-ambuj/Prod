import { Link } from 'react-router-dom'

const LandingPage = () => {
	return (
		<main className="landing-simple">
			<section>
				<h1>Application</h1>
				<p>Log in or create an account to continue.</p>
				<div className="landing-actions">
					<Link to="/login">Log in</Link>
					<Link to="/register">Register</Link>
				</div>
			</section>
		</main>
	)
}

export default LandingPage
