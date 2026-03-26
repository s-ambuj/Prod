import { useState } from 'react'
const LoginForm = () => {
    const[username, setUsername] = useState('')
    const[password, setPassword] = useState('')
    const handleSubmit = (e) => {
        e.preventDefault()
        alert(`Username: ${username}, Password: ${password}`)
        setUsername('')
        setPassword('')
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <h1>Login</h1>
                    <label htmlFor='username'>Username: </label>
                    <input type='text' id='username' value={username} 
                    onChange={(e) => setUsername(e.target.value)} /><br />
                    <label htmlFor='password'>Password: </label>
                    <input type='password' id='password' value={password} 
                    onChange={(e) => setPassword(e.target.value)} />
                    <button type='submit'>Login</button>
                </div>
            
            </form>
        </div>
    );
}

export default LoginForm;