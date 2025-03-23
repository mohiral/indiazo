"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft, FaShieldAlt, FaCheck } from "react-icons/fa"

const PrivacyPolicy = () => {
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
    { id: "information-collection", title: "Information Collection" },
    { id: "information-use", title: "Use of Information" },
    { id: "information-sharing", title: "Information Sharing" },
    { id: "data-security", title: "Data Security" },
    { id: "user-rights", title: "Your Rights" },
    { id: "children", title: "Children's Privacy" },
    { id: "changes", title: "Changes to Policy" },
    { id: "contact", title: "Contact Us" }
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
          <h1 className="text-2xl font-bold text-gray-800">Privacy Policy</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
            <FaShieldAlt className="text-blue-600 text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
            Privacy Policy
          </h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Last Updated: {lastUpdated}
          </p>
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
                  Welcome to AL Games ("we," "our," or "us"). We are committed to protecting your privacy and providing you with a safe and secure experience when using our interactive entertainment platform and services.
                </p>
                <p className="text-gray-600 mb-4">
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application, website, and related services (collectively, the "Service"). Please read this Privacy Policy carefully. By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
                </p>
                <p className="text-gray-600">
                  If you do not agree with the terms of this Privacy Policy, please do not access the Service.
                </p>
              </section>

              <section id="information-collection" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">2. Information Collection</h3>
                <p className="text-gray-600 mb-4">
                  We may collect several types of information from and about users of our Service, including:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                  <li>
                    <strong>Personal Information:</strong> This includes information that can be used to identify you, such as your name, email address, telephone number, and date of birth.
                  </li>
                  <li>
                    <strong>Account Information:</strong> Information you provide when creating an account, such as username, password, and profile information.
                  </li>
                  <li>
                    <strong>Transaction Information:</strong> Records of virtual currency transactions, in-app purchases, and other activities within the Service.
                  </li>
                  <li>
                    <strong>Device Information:</strong> Information about your device, including device type, operating system, unique device identifiers, IP address, mobile network information, and device settings.
                  </li>
                  <li>
                    <strong>Usage Information:</strong> Information about how you use our Service, including game statistics, preferences, and interaction with other users.
                  </li>
                  <li>
                    <strong>Location Information:</strong> With your consent, we may collect and process information about your precise or approximate location.
                  </li>
                </ul>
                <p className="text-gray-600">
                  We collect this information directly from you when you provide it to us, automatically as you navigate through the Service, and from third parties such as social media platforms if you choose to link your accounts.
                </p>
              </section>

              <section id="information-use" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">3. Use of Information</h3>
                <p className="text-gray-600 mb-4">
                  We use the information we collect about you or that you provide to us for various purposes, including:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                  <li>To provide, maintain, and improve our Service</li>
                  <li>To process transactions and manage your account</li>
                  <li>To personalize your experience and deliver content relevant to your interests</li>
                  <li>To communicate with you about updates, promotions, and other news about our Service</li>
                  <li>To monitor and analyze usage patterns and trends</li>
                  <li>To detect, prevent, and address technical issues, fraud, and other illegal activities</li>
                  <li>To comply with legal obligations</li>
                  <li>To enforce our terms, conditions, and policies</li>
                </ul>
                <p className="text-gray-600">
                  We may also use your information in any other way we may describe when you provide the information or for any other purpose with your consent.
                </p>
              </section>

              <section id="information-sharing" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">4. Information Sharing</h3>
                <p className="text-gray-600 mb-4">
                  We may disclose personal information that we collect or you provide:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                  <li>
                    <strong>Service Providers:</strong> To contractors, service providers, and other third parties we use to support our business and who are bound by contractual obligations to keep personal information confidential.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> If required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
                  </li>
                  <li>
                    <strong>Protection of Rights:</strong> To enforce our rights arising from any contracts entered into between you and us, including our Terms of Service.
                  </li>
                  <li>
                    <strong>With Your Consent:</strong> In any other way we may describe when you provide the information or with your consent.
                  </li>
                </ul>
                <p className="text-gray-600">
                  We do not sell, rent, or lease your personal information to third parties without your consent.
                </p>
              </section>

              <section id="data-security" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">5. Data Security</h3>
                <p className="text-gray-600 mb-4">
                  We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
                </p>
                <p className="text-gray-600">
                  We will make any legally required disclosures of any breach of the security, confidentiality, or integrity of your unencrypted electronically stored "personal data" (as defined in applicable laws) to you via email or conspicuous posting on our Service in the most expedient time possible and without unreasonable delay.
                </p>
              </section>

              <section id="user-rights" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">6. Your Rights</h3>
                <p className="text-gray-600 mb-4">
                  Depending on your location, you may have certain rights regarding your personal information, including:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                  <li>The right to access personal information we hold about you</li>
                  <li>The right to request correction of inaccurate personal information</li>
                  <li>The right to request deletion of your personal information</li>
                  <li>The right to object to processing of your personal information</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent</li>
                </ul>
                <p className="text-gray-600">
                  To exercise any of these rights, please contact us using the contact information provided at the end of this Privacy Policy. We may ask you to verify your identity before responding to such requests.
                </p>
              </section>

              <section id="children" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">7. Children's Privacy</h3>
                <p className="text-gray-600 mb-4">
                  Our Service is not directed to anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your Child has provided us with personal information, please contact us. If we become aware that we have collected personal information from children without verification of parental consent, we take steps to remove that information from our servers.
                </p>
              </section>

              <section id="changes" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">8. Changes to This Privacy Policy</h3>
                <p className="text-gray-600 mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
                </p>
                <p className="text-gray-600">
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
              </section>

              <section id="contact" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">9. Contact Us</h3>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
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

export default PrivacyPolicy
