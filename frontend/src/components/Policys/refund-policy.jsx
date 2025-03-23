"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft, FaExchangeAlt } from "react-icons/fa"

const RefundPolicy = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState("introduction")

  const handleBack = () => {
    navigate(-1)
  }

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
  }

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "refund-eligibility", title: "Refund Eligibility" },
    { id: "refund-process", title: "Refund Process" },
    { id: "virtual-currency", title: "Virtual Currency" },
    { id: "exceptions", title: "Exceptions" },
    { id: "contact", title: "Contact Us" },
  ]

  const lastUpdated = "November 15, 2023"

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
          <h1 className="text-2xl font-bold text-gray-800">Refund Policy</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
            <FaExchangeAlt className="text-blue-600 text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
            Refund Policy
          </h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">Last Updated: {lastUpdated}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-20">
              <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b">On This Page</h3>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`text-left w-full px-2 py-1.5 rounded-md text-sm transition-colors ${
                        activeSection === section.id
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              <section id="introduction" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h3>
                <p className="text-gray-600 mb-4">
                  This Refund Policy outlines the terms and conditions regarding refunds for purchases made within the
                  AL Games mobile application and website (collectively, the "Service"). By using our Service, you agree
                  to this Refund Policy.
                </p>
                <p className="text-gray-600">
                  We strive to provide a high-quality entertainment experience. However, we understand that there may be
                  instances where a refund is warranted. This policy explains when and how you can request a refund for
                  purchases made through our Service.
                </p>
              </section>

              <section id="refund-eligibility" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">2. Refund Eligibility</h3>
                <p className="text-gray-600 mb-4">Refunds may be considered under the following circumstances:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                  <li>Unauthorized purchases made by minors without parental consent</li>
                  <li>Accidental purchases where the Service was not used</li>
                  <li>Technical issues that prevent access to purchased content</li>
                  <li>Fraudulent transactions not authorized by the account holder</li>
                  <li>Service not provided as described</li>
                </ul>
                <p className="text-gray-600">
                  Refund requests will be evaluated on a case-by-case basis. We reserve the right to deny refund
                  requests that do not meet our eligibility criteria or that we determine to be fraudulent or abusive.
                </p>
              </section>

              <section id="refund-process" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">3. Refund Process</h3>
                <p className="text-gray-600 mb-4">To request a refund, please follow these steps:</p>
                <ol className="list-decimal pl-6 mb-4 text-gray-600 space-y-2">
                  <li>
                    Contact our customer support team through the contact information provided at the end of this policy
                  </li>
                  <li>Provide your account information, including username or email address</li>
                  <li>Include details of the purchase, such as the date, amount, and item purchased</li>
                  <li>Explain the reason for your refund request</li>
                  <li>Include any relevant documentation or evidence to support your request</li>
                </ol>
                <p className="text-gray-600 mb-4">
                  We will review your request and respond within 5-7 business days. If your refund is approved, the
                  amount will be credited back to the original payment method used for the purchase. The time it takes
                  for the refund to appear in your account depends on your payment provider and may take up to 30 days.
                </p>
                <p className="text-gray-600">
                  For purchases made through third-party app stores (such as Google Play Store or Apple App Store),
                  refund requests must be submitted directly to the respective app store according to their refund
                  policies.
                </p>
              </section>

              <section id="virtual-currency" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">4. Virtual Currency and In-App Purchases</h3>
                <p className="text-gray-600 mb-4">
                  All purchases of virtual currency, points, or credits ("Virtual Currency") are final and
                  non-refundable, except in the specific circumstances outlined in the Refund Eligibility section or as
                  required by applicable law.
                </p>
                <p className="text-gray-600 mb-4">
                  If a refund is issued for a purchase of Virtual Currency, the corresponding Virtual Currency will be
                  removed from your account. If you have already used some or all of the Virtual Currency, we may deduct
                  the value of the used portion from your refund amount.
                </p>
                <p className="text-gray-600">We do not provide refunds for:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Virtual Currency that has been used within the Service</li>
                  <li>Dissatisfaction with game outcomes or results</li>
                  <li>Changes to the Service or Virtual Currency exchange rates</li>
                  <li>Requests made more than 30 days after the purchase</li>
                </ul>
              </section>

              <section id="exceptions" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">5. Exceptions and Special Circumstances</h3>
                <p className="text-gray-600 mb-4">
                  In certain jurisdictions, you may have additional rights regarding refunds that supersede this policy.
                  Nothing in this Refund Policy is intended to limit your statutory rights.
                </p>
                <p className="text-gray-600 mb-4">
                  For users in the European Union, you have the right to withdraw from a purchase within 14 days without
                  giving any reason, except where:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                  <li>
                    You have consented to the immediate performance of services and acknowledged that you will lose your
                    right of withdrawal once the service has been fully performed
                  </li>
                  <li>
                    The supply of digital content has begun with your prior express consent and your acknowledgment that
                    you thereby lose your right of withdrawal
                  </li>
                </ul>
                <p className="text-gray-600">
                  In cases of suspected fraud or abuse of our refund policy, we reserve the right to deny refund
                  requests and take appropriate action, including account suspension or termination.
                </p>
              </section>

              <section id="contact" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">6. Contact Us</h3>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Refund Policy or would like to request a refund, please contact
                  us:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>By email: support@algames.com</li>
                  <li>By phone: +91 9784860973</li>
                  <li>By mail: 123 Gaming Street, Tech City, India</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RefundPolicy

