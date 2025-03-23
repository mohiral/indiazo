"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft, FaFileContract } from "react-icons/fa"

const TermsOfService = () => {
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
    { id: "eligibility", title: "Eligibility" },
    { id: "user-accounts", title: "User Accounts" },
    { id: "virtual-currency", title: "Virtual Currency" },
    { id: "user-conduct", title: "User Conduct" },
    { id: "intellectual-property", title: "Intellectual Property" },
    { id: "disclaimers", title: "Disclaimers" },
    { id: "limitation-liability", title: "Limitation of Liability" },
    { id: "termination", title: "Termination" },
    { id: "governing-law", title: "Governing Law" },
    { id: "changes", title: "Changes to Terms" },
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
          <h1 className="text-2xl font-bold text-gray-800">Terms of Service</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-3">
            <FaFileContract className="text-blue-600 text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
            Terms of Service
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
                  Welcome to AL Games ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our mobile application, website, and related services (collectively, the "Service").
                </p>
                <p className="text-gray-600 mb-4">
                  Please read these Terms carefully before using our Service. By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you disagree with any part of the Terms, you may not access the Service.
                </p>
                <p className="text-gray-600">
                  Our Service provides an interactive entertainment platform where users can participate in skill-based games, challenges, and social activities.
                </p>
              </section>

              <section id="eligibility" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">2. Eligibility</h3>
                <p className="text-gray-600 mb-4">
                  You must be at least 18 years old to use our Service. By using the Service, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms.
                </p>
                <p className="text-gray-600">
                  The Service is intended for users who are residents of jurisdictions where access to and use of the Service is legal. You are responsible for determining whether your use of the Service is legal in your jurisdiction. We reserve the right to limit the availability of the Service to any person, geographic area, or jurisdiction at any time.
                </p>
              </section>

              <section id="user-accounts" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">3. User Accounts</h3>
                <p className="text-gray-600 mb-4">
                  To access certain features of the Service, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>
                <p className="text-gray-600 mb-4">
                  You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. We encourage you to use a strong password (using a combination of upper and lower case letters, numbers, and symbols) with your account.
                </p>
                <p className="text-gray-600">
                  You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                </p>
              </section>

              <section id="virtual-currency" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">4. Virtual Currency and In-App Purchases</h3>
                <p className="text-gray-600 mb-4">
                  Our Service may include virtual currency, points, or credits ("Virtual Currency") that can be purchased with real money or earned through participation in certain activities within the Service. Virtual Currency can only be used within the Service to obtain virtual items, access special features, or participate in certain activities.
                </p>
                <p className="text-gray-600 mb-4">
                  Virtual Currency has no real-world value and cannot be exchanged for cash or any other tangible items. We reserve the right to control, regulate, change, or remove any Virtual Currency at any time without any liability to you.
                </p>
                <p className="text-gray-600 mb-4">
                  All purchases of Virtual Currency are final and non-refundable, except as required by applicable law. You acknowledge that we are not required to provide a refund for any reason, and you will not receive money or other compensation for unused Virtual Currency when an account is closed, whether such closure was voluntary or involuntary.
                </p>
                <p className="text-gray-600">
                  You agree that you do not own the Virtual Currency or any virtual items, but instead you purchase a limited, personal, revocable, non-transferable, non-sublicensable license to use the Virtual Currency or virtual items within the Service.
                </p>
              </section>

              <section id="user-conduct" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">5. User Conduct</h3>
                <p className="text-gray-600 mb-4">
                  You agree not to use the Service for any purpose that is prohibited by these Terms. You are responsible for all of your activity in connection with the Service.
                </p>
                <p className="text-gray-600 mb-4">
                  Prohibited activities include, but are not limited to:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
                  <li>Using the Service for any illegal purpose or in violation of any local, state, national, or international law</li>
                  <li>Harassing, threatening, or intimidating other users</li>
                  <li>Engaging in any form of automated use of the system</li>
                  <li>Attempting to circumvent any security measures or rate limits</li>
                  <li>Using the Service to distribute unsolicited promotional or commercial content</li>
                  <li>Impersonating another person or entity</li>
                  <li>Interfering with or disrupting the Service or servers or networks connected to the Service</li>
                  <li>Cheating or manipulating the gameplay or scoring mechanisms</li>
                  <li>Exploiting bugs or unintended features of the Service</li>
                  <li>Selling, trading, or transferring access to your account or Virtual Currency to another person</li>
                </ul>
                <p className="text-gray-600">
                  We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any breach of these Terms, including engaging in any of the prohibited activities.
                </p>
              </section>

              <section id="intellectual-property" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">6. Intellectual Property Rights</h3>
                <p className="text-gray-600 mb-4">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of AL Games and its licensors. The Service is protected by copyright, trademark, and other laws of both the India and foreign countries.
                </p>
                <p className="text-gray-600 mb-4">
                  Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of AL Games.
                </p>
                <p className="text-gray-600">
                  You acknowledge and agree that any feedback, comments, or suggestions you may provide regarding the Service are entirely voluntary, and we will be free to use such feedback, comments, or suggestions as we see fit without any obligation to you.
                </p>
              </section>

              <section id="disclaimers" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">7. Disclaimers</h3>
                <p className="text-gray-600 mb-4">
                  YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p className="text-gray-600 mb-4">
                  We make no warranty that (i) the Service will meet your requirements, (ii) the Service will be uninterrupted, timely, secure, or error-free, (iii) the results that may be obtained from the use of the Service will be accurate or reliable, or (iv) any errors in the Service will be corrected.
                </p>
                <p className="text-gray-600">
                  Any material downloaded or otherwise obtained through the use of the Service is done at your own discretion and risk, and you will be solely responsible for any damage to your computer system or mobile device or loss of data that results from the download of any such material.
                </p>
              </section>

              <section id="limitation-liability" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">8. Limitation of Liability</h3>
                <p className="text-gray-600 mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL WE, OUR AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, THAT RESULT FROM THE USE OF, OR INABILITY TO USE, THE SERVICE.
                </p>
                <p className="text-gray-600 mb-4">
                  UNDER NO CIRCUMSTANCES WILL WE BE RESPONSIBLE FOR ANY DAMAGE, LOSS, OR INJURY RESULTING FROM HACKING, TAMPERING, OR OTHER UNAUTHORIZED ACCESS OR USE OF THE SERVICE OR YOUR ACCOUNT OR THE INFORMATION CONTAINED THEREIN.
                </p>
                <p className="text-gray-600">
                  IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, OR CAUSES OF ACTION EXCEED THE AMOUNT YOU HAVE PAID US IN THE LAST SIX (6) MONTHS, OR, IF GREATER, ONE HUNDRED DOLLARS ($100).
                </p>
              </section>

              <section id="termination" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">9. Termination</h3>
                <p className="text-gray-600 mb-4">
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
                </p>
                <p className="text-gray-600 mb-4">
                  Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
                </p>
                <p className="text-gray-600">
                  All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                </p>
              </section>

              <section id="governing-law" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">10. Governing Law</h3>
                <p className="text-gray-600 mb-4">
                  These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                </p>
                <p className="text-gray-600">
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
                </p>
              </section>

              <section id="changes" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">11. Changes to Terms</h3>
                <p className="text-gray-600 mb-4">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page and updating the "Last Updated" date.
                </p>
                <p className="text-gray-600 mb-4">
                  Your continued use of the Service after any such changes constitutes your acceptance of the new Terms. If you do not agree to the new terms, please stop using the Service.
                </p>
                <p className="text-gray-600">
                  It is your responsibility to review these Terms periodically for changes.
                </p>
              </section>

              <section id="contact" className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">12. Contact Us</h3>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms, please contact us:
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

export default TermsOfService
