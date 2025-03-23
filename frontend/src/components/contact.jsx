"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { 
  FaPhone, 
  FaWhatsapp, 
  FaEnvelope, 
  FaArrowLeft, 
  FaHeadset, 
  FaMapMarkerAlt, 
  FaUser, 
  FaPaperPlane,
  FaCheck
} from "react-icons/fa"

const ContactPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Contact information
  const contactInfo = {
    phone: "+919784860973",
    whatsapp: "9784860973",
    email: "support@algames.com",
    address: "123 Gaming Street, Tech City, India"
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({
        name: "",
        email: "",
        message: ""
      })
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    }, 1500)
  }

  const handleCall = () => {
    window.location.href = `tel:${contactInfo.phone}`
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hello, I need assistance with my AL Games account.")
    window.location.href = `https://wa.me/${contactInfo.whatsapp}?text=${message}`
  }

  const handleEmail = () => {
    window.location.href = `mailto:${contactInfo.email}?subject=Support Request - AL Games`
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-16 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors mr-3"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Contact Us</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
            <FaHeadset className="text-blue-600 text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
            We're Here To Help
          </h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Have questions or need assistance? Reach out to our support team through any of the channels below.
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {/* Call Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCall}
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer border border-gray-100 hover:shadow-lg transition-all duration-300"
          >
            <div className="p-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
                <FaPhone className="text-green-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-800 mb-2">Call Us</h3>
              <p className="text-center text-blue-600 font-medium">{contactInfo.phone}</p>
              <div className="mt-4 text-center">
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-colors flex items-center justify-center mx-auto"
                >
                  <FaPhone className="mr-2" /> Call Now
                </button>
              </div>
            </div>
          </motion.div>

          {/* WhatsApp Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleWhatsApp}
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer border border-gray-100 hover:shadow-lg transition-all duration-300"
          >
            <div className="p-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
                <FaWhatsapp className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-800 mb-2">WhatsApp</h3>
              <p className="text-center text-blue-600 font-medium">+91 {contactInfo.whatsapp}</p>
              <div className="mt-4 text-center">
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-colors flex items-center justify-center mx-auto"
                >
                  <FaWhatsapp className="mr-2" /> Chat Now
                </button>
              </div>
            </div>
          </motion.div>

          {/* Email Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEmail}
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer border border-gray-100 hover:shadow-lg transition-all duration-300"
          >
            <div className="p-6">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                <FaEnvelope className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-800 mb-2">Email</h3>
              <p className="text-center text-blue-600 font-medium">{contactInfo.email}</p>
              <div className="mt-4 text-center">
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-colors flex items-center justify-center mx-auto"
                >
                  <FaEnvelope className="mr-2" /> Send Email
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contact Form and Address */}
        
        {/* Quick Contact Buttons (Mobile Friendly) */}
        <div className="fixed bottom-20 right-4 z-40 flex flex-col space-y-3">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCall}
            className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg"
            aria-label="Call us"
          >
            <FaPhone />
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWhatsApp}
            className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg"
            aria-label="WhatsApp us"
          >
            <FaWhatsapp />
          </motion.button>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEmail}
            className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg"
            aria-label="Email us"
          >
            <FaEnvelope />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
