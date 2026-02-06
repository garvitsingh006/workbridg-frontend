import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <motion.div
          className="bg-black text-white py-12 px-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-gray-300">Last updated: 1st November, 2024</p>
        </motion.div>

        <motion.div
          className="p-8 md:p-12 space-y-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Workbridg is a discovery and communication platform that connects clients with freelancers. Workbridg provides freelancer verification, project listing tools, chat functionality, and optional admin moderation when explicitly enabled by the client. Workbridg is not a party to any agreement formed between clients and freelancers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Platform Scope</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>All project terms including scope, timelines, pricing, interviews, and delivery are decided solely between the client and freelancer.</li>
              <li>Workbridg does not guarantee project completion, quality of work, or adherence to timelines.</li>
              <li>Confirmation buttons such as “I have paid” or “I have received” are for record-keeping only.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Payments & Fees</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>All project payments are made directly between clients and freelancers using methods agreed between them.</li>
              <li>Workbridg does not collect, store, process, or intermediate project funds.</li>
              <li>Clients select a payment method at project creation (milestone-based, upfront split, or hourly / weekly).</li>
              <li>If a client enables admin project moderation at project creation, a one-time 5% service fee is payable to Workbridg.</li>
              <li>This service fee is independent of project payments and is non-refundable once moderation begins.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Admin Moderation</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Admin moderation is optional and must be explicitly enabled by the client at project creation.</li>
              <li>When enabled, Workbridg may assist with communication, milestone tracking, or interviews if requested by the client.</li>
              <li>Admin moderation does not make Workbridg responsible for project outcomes or payment disputes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Ownership of delivered work transfers to the client only after full payment, unless otherwise agreed in writing.</li>
              <li>Workbridg is not liable for intellectual property disputes between users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Prohibited Activities</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Fraud, impersonation, harassment, illegal activity, or misuse of the platform is prohibited.</li>
              <li>Workbridg reserves the right to restrict or terminate accounts for violations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Workbridg acts solely as a platform and service provider.</li>
              <li>Workbridg is not liable for disputes, delays, non-payment, or unsatisfactory outcomes between users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
            <p className="text-gray-700">These Terms are governed by the laws of India. Any disputes shall be subject to local jurisdiction.</p>
          </section>

          <section className="pt-6 border-t border-gray-200">
            <p className="text-gray-700 font-medium">
              Contact: <a href="mailto:workbridg.team@gmail.com" className="text-blue-600 hover:underline">workbridg.team@gmail.com</a>
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
