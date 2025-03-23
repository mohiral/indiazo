import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin_Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate authentication (replace with real auth logic)
        if (username === 'admin' && password === 'admin123') {
            onLogin(true);  // Update authentication status
            navigate('/admin');  // Redirect to admin home
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-pink-500">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <div className="mb-6">
                    <label className="block text-gray-700 text-lg font-medium">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-2 border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your username"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-lg font-medium">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-2 border-2 border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your password"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                >
                    Login
                </button>

                <div className="mt-4 text-center">
                    <p className="text-gray-600 text-sm">Forgot password? <a href="#" className="text-purple-600 hover:underline">Reset it here</a></p>
                </div>
            </form>
        </div>
    );
};

export default Admin_Login;
