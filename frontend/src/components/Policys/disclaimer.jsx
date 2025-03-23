"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft, FaExclamationTriangle } from "react-icons/fa"

const Disclaimer = () => {
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
    { id: "entertainment-purpose", title: "Entertainment Purpose" },
    { id: "no-guarantees", title: "No Guarantees" },
    { id: "user-responsibility", title: "User Responsibility" },
    { id: "third-party-links", title: "Third-Party Links" },
    { id: "changes", title: "Changes to Disclaimer" },
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
          <h1 className="text-2xl font-bold text-gray-800">Disclaimer</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
            <FaExclamationTriangle className="text-blue-600 text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
            Disclaimer
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
                  This disclaimer ("Disclaimer") applies to the AL Games mobile application, website, and related
                  services (collectively, the "Service"). By accessing or using the Service, you acknowledge that you
                  have read, understood, and agree to be bound by this Disclaimer.
                </p>
                <p className="text-gray-600">
                  If you do not agree with any part of this Disclaimer, please do not use our Service.
                </p>
              </section>

              <section id="entertainment-purpose" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">2. Entertainment Purpose</h3>
                <p className="text-gray-600 mb-4">
                  AL Games is designed and intended for entertainment purposes only. Our Service provides interactive
                  games, challenges, and social features that are meant to be enjoyed as a form of entertainment.
                </p>
                <p className="text-gray-600 mb-4">
                  The virtual currency, points, or credits available within the Service have no real-world value and are
                  intended solely for use within the Service for entertainment purposes.
                </p>
                <p className="text-gray-600">
                  Our Service is not designed to be a source of income or financial gain. Any virtual rewards or
                  achievements obtained through the Service are for entertainment value only.
                </p>
              </section>

              <section id="no-guarantees" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">3. No Guarantees</h3>
                <p className="text-gray-600 mb-4">
                  We make no guarantees, representations, or warranties of any kind regarding the Service, including but
                  not limited to:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                  <li>The availability or uninterrupted operation of the Service</li>
                  <li>The accuracy, reliability, or completeness of any content within the Service</li>
                  <li>The performance or outcomes of any games or activities within the Service</li>
                  <li>The security of your account or personal information</li>
                  <li>The compatibility of the Service with your device or software</li>
                </ul>
                <p className="text-gray-600">
                  The Service is provided on an "as is" and "as available" basis without warranties of any kind, either
                  express or implied, including, but not limited to, implied warranties of merchantability, fitness for
                  a particular purpose, or non-infringement.
                </p>
              </section>

              <section id="user-responsibility" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">4. User Responsibility</h3>
                <p className="text-gray-600 mb-4">
                  You are solely responsible for your use of the Service and any consequences that may result from such
                  use. This includes, but is not limited to:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                  <li>Your decision to download, install, or use the Service</li>
                  <li>Any purchases or transactions you make within the Service</li>
                  <li>The time you spend using the Service</li>
                  <li>Any content you submit, post, or share through the Service</li>
                  <li>Your interactions with other users of the Service</li>
                </ul>
                <p className="text-gray-600 mb-4">
                  We encourage responsible use of our Service. If you feel that you are spending too much time or money
                  on our Service, we recommend that you take a break or seek appropriate help.
                </p>
                <p className="text-gray-600">
                  You are responsible for ensuring that your use of the Service complies with all applicable laws and
                  regulations in your jurisdiction.
                </p>
              </section>

              <section id="third-party-links" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">5. Third-Party Links and Services</h3>
                <p className="text-gray-600 mb-4">
                  Our Service may contain links to third-party websites, applications, or services that are not owned or
                  controlled by us. We have no control over, and assume no responsibility for, the content, privacy
                  policies, or practices of any third-party websites or services.
                </p>
                <p className="text-gray-600 mb-4">
                  You acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any
                  damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any
                  such content, goods, or services available on or through any such websites or services.
                </p>
                <p className="text-gray-600">
                  We strongly advise you to read the terms and conditions and privacy policies of any third-party
                  websites or services that you visit or use.
                </p>
              </section>

              <section id="changes" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">6. Changes to Disclaimer</h3>
                <p className="text-gray-600 mb-4">
                  We reserve the right to modify or replace this Disclaimer at any time at our sole discretion. The most
                  current version will be posted on this page with the effective date.
                </p>
                <p className="text-gray-600">
                  Your continued use of the Service after any changes to the Disclaimer constitutes your acceptance of
                  such changes. We encourage you to review this Disclaimer periodically for any changes.
                </p>
              </section>

              <section id="contact" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">7. Contact Us</h3>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Disclaimer, please contact us:
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

export default Disclaimer

