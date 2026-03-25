import { Link } from 'react-router-dom'

type NavbarProps = {
	isAuthed: boolean
	userEmail?: string
	onLogout: () => void
}

const Navbar = ({ isAuthed, userEmail, onLogout }: NavbarProps) => {
	return (
		<header className="navbar">
			<nav aria-label="Main">
				<div className="navbar-brand">
					<Link to="/">Application</Link>
					<span className="navbar-tagline">Just some application</span>
				</div>
				<div className="navbar-links">
					{isAuthed ? (
						<>
							<Link to="/dashboard">Dashboard</Link>
							<span className="navbar-user">{userEmail || 'Signed in'}</span>
							<button type="button" onClick={onLogout}>
								Sign out
							</button>
						</>
					) : (
						<>
							<Link to="/login">Login</Link>
							<Link className="cta" to="/register">
								Register
							</Link>
						</>
					)}
				</div>
			</nav>
		</header>
	)
}

export default Navbar
