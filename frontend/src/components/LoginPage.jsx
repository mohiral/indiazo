"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FaUserCircle, FaLock, FaMobile } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

const LoginPage = () => {
  const navigate = useNavigate()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [user, setUser] = useState(null)
  const [isSignup, setIsSignup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    name: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      navigate("/") // Redirect to home page if already logged in
    }
    setIsCheckingAuth(false)
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

  const saveUserToDB = async (userData) => {
    try {
      const response = await fetch("https://backend.indiazo.com/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      const data = await response.json()
      console.log("User saved to DB:", data)
      return data
    } catch (error) {
      console.error("Error saving user to DB:", error)
      setError("Failed to save user data. Please try again.")
      throw error
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.mobile || !formData.password) {
      setError("Please enter both mobile number and password")
      setIsLoading(false)
      return
    }

    try {
      // Check if user exists in database
      const response = await fetch(`https://backend.indiazo.com/api/users?mobile=${formData.mobile}`)
      const users = await response.json()
      const existingUser = users.find((u) => u.userId === formData.mobile)

      if (existingUser) {
        // Verify the password
        if (existingUser.password !== formData.password) {
          setError("Incorrect password. Please try again.")
          setIsLoading(false)
          return
        }

        const userData = {
          userId: formData.mobile,
          name: existingUser.name,
          email: existingUser.email || "al@gmail.com",
          password: formData.password,
          isLoggedIn: true,
        }

        // Update login status in DB
        await saveUserToDB(userData)

        // Store in localStorage (without password)
        const userForStorage = {
          userId: formData.mobile,
          name: existingUser.name,
          email: existingUser.email || "al@gmail.com",
        }

        localStorage.setItem("user", JSON.stringify(userForStorage))
        setUser(userForStorage)

        // Redirect to home page after successful login
        navigate("/")
      } else {
        setError("User not found. Please sign up first.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.mobile || !formData.password || !formData.name) {
      setError("Please fill all fields")
      setIsLoading(false)
      return
    }

    try {
      // Check if user already exists
      const response = await fetch(`https://backend.indiazo.com/api/users?mobile=${formData.mobile}`)
      const users = await response.json()
      const existingUser = users.find((u) => u.userId === formData.mobile)

      if (existingUser) {
        setError("User with this mobile number already exists. Please sign in.")
        setIsLoading(false)
        return
      }

      const userData = {
        userId: formData.mobile,
        name: formData.name,
        email: "al@gmail.com",
        password: formData.password, // Include password in the request
        isLoggedIn: true,
      }

      // Save to database
      const result = await saveUserToDB(userData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Save to local storage (without password)
      const userForStorage = {
        userId: formData.mobile,
        name: formData.name,
        email: "al@gmail.com",
      }

      localStorage.setItem("user", JSON.stringify(userForStorage))
      setUser(userForStorage)

      // Redirect to home page after successful signup
      navigate("/")
    } catch (error) {
      console.error("Signup error:", error)
      setError("Signup failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    const userId = user?.userId
    if (userId) {
      try {
        // Make sure the endpoint matches exactly what's in your Express router
        await fetch("https://backend.indiazo.com/api/users/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
      } catch (error) {
        console.error("Error logging out from DB:", error)
      }
    }
    localStorage.removeItem("user")
    setUser(null)
    setIsLoading(false)
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    setError("")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-2xl min-h-screen flex items-center justify-center p-8"
    >
      <div className="text-center w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-700 mb-8">Welcome to Gama 567</h1>
        <div className="p-6 bg-gradient-to-b from-blue-50 to-indigo-100 rounded-2xl shadow-inner">
          <FaUserCircle className="text-6xl text-blue-600 mb-4 mx-auto" />

          {user ? (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Hello, {user.name}</h2>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center w-full`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">{isSignup ? "Sign Up" : "Sign In"}</h2>

              {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">{error}</div>}

              <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
                {isSignup && (
                  <div className="flex items-center border-2 border-gray-300 rounded-md px-3 py-2 bg-white">
                    <FaUserCircle className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="flex-1 outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center border-2 border-gray-300 rounded-md px-3 py-2 bg-white">
                  <FaMobile className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="mobile"
                    placeholder="Mobile Number"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="flex-1 outline-none"
                  />
                </div>

                <div className="flex items-center border-2 border-gray-300 rounded-md px-3 py-2 bg-white">
                  <FaLock className="text-gray-400 mr-2" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : isSignup ? (
                    "Sign Up"
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="mt-4 text-sm">
                {isSignup ? (
                  <p>
                    Already have an account?{" "}
                    <button onClick={toggleMode} className="text-blue-600 hover:underline">
                      Sign In
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{" "}
                    <button onClick={toggleMode} className="text-blue-600 hover:underline">
                      Sign Up
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default LoginPage

