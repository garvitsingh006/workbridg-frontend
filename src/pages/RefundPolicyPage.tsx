import { motion } from "framer-motion";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <motion.div
          className="bg-black text-white py-12 px-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">Refund & Cancellation Policy</h1>
          <p className="text-gray-300">Last updated: 1st November, 2024</p>
        </motion.div>

        <motion.div
          className="p-8 md:p-12 space-y-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Project Cancellation</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Projects may be cancelled by mutual agreement between the client and freelancer.</li>
              <li>Workbridg does not enforce or guarantee cancellation terms agreed between users.</li>
              <li>Cancellation rules may differ based on the selected payment model.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Refunds</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Workbridg does not process payments and does not issue refunds.</li>
              <li>Refunds, if any, are solely handled between the client and freelancer.</li>
              <li>Refund eligibility depends on the private agreement and payment method used.</li>
              <li>Service charges paid to Workbridg under the subscription-based project moderation model are non-refundable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Payments</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>All payments occur directly between clients and freelancers.</li>
              <li>Workbridg does not hold funds, operate escrow services, or control payment timelines.</li>
              <li>Any delays, failures, or disputes related to payments are outside WorkBridg’s control.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Disputes & Mediation</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              {/* <li>Dispute assistance is available only for clients enrolled in the subscription-based project moderation service.</li> */}
              <li>Workbridg mediation aims to assist communication and resolution but does not impose binding decisions.</li>
              <li>Final outcomes remain the responsibility of the client and freelancer.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions regarding refunds or cancellations, contact:
              <a href="mailto:workbridg.team@gmail.com" className="text-blue-600 hover:underline ml-1">
                workbridg.team@gmail.com
              </a>
            </p>
          </section>

          {/* <section className="pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              This policy clarifies WorkBridg’s limited role and does not override private agreements between users.
            </p>
          </section> */}
        </motion.div>
      </div>
    </div>
  );
}
