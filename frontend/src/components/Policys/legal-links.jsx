"use client"

import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft, FaFileAlt, FaShieldAlt, FaExchangeAlt, FaExclamationTriangle } from "react-icons/fa"

const LegalLinks = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  const legalDocuments = [
    {
      title: "Terms of Service",
      description: "Rules and guidelines for using our platform",
      icon: <FaFileAlt className="text-blue-600 text-xl" />,
      path: "/terms-of-service",
      color: "from-blue-500 to-indigo-600",
      hoverColor: "from-blue-600 to-indigo-700",
    },
    {
      title: "Privacy Policy",
      description: "How we collect, use, and protect your data",
      icon: <FaShieldAlt className="text-green-600 text-xl" />,
      path: "/privacy-policy",
      color: "from-green-500 to-emerald-600",
      hoverColor: "from-green-600 to-emerald-700",
    },
    {
      title: "Refund Policy",
      description: "Our policies regarding refunds and cancellations",
      icon: <FaExchangeAlt className="text-purple-600 text-xl" />,
      path: "/refund-policy",
      color: "from-purple-500 to-violet-600",
      hoverColor: "from-purple-600 to-violet-700",
    },
    {
      title: "Disclaimer",
      description: "Important notices and limitations of liability",
      icon: <FaExclamationTriangle className="text-amber-600 text-xl" />,
      path: "/disclaimer",
      color: "from-amber-500 to-orange-600",
      hoverColor: "from-amber-600 to-orange-700",
    },
  ]

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
          <h1 className="text-2xl font-bold text-gray-800">Legal Information</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
            <FaFileAlt className="text-blue-600 text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
            Legal Documents
          </h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Important information about your rights and our policies
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {legalDocuments.map((doc, index) => (
            <motion.div
              key={doc.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer border border-gray-100 hover:shadow-lg transition-all duration-300"
              onClick={() => navigate(doc.path)}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${doc.color} flex items-center justify-center text-white shadow-md`}
                  >
                    {doc.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-gray-800">{doc.title}</h3>
                    <p className="text-gray-500 text-sm">{doc.description}</p>
                  </div>
                </div>
                <button
                  className={`w-full py-2 px-4 rounded-lg font-medium bg-gradient-to-r ${doc.color} hover:${doc.hoverColor} text-white transition-all duration-300`}
                >
                  View Document
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Important Notice</h3>
          <p className="text-gray-600 mb-4">
            AL Games is an entertainment platform designed for users aged 18 and above. Our games are designed for fun
            and entertainment purposes only. We encourage responsible gaming and recommend setting personal time and
            spending limits.
          </p>
          <p className="text-gray-600">
            If you have any questions about our legal documents or policies, please contact our support team at
            support@algames.com or call us at +91 9784860973.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LegalLinks

