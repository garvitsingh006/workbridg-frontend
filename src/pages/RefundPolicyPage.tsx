import { motion } from 'framer-motion';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 mt-10">
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
          className="p-8 md:p-12 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Project Cancellation</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Projects can be canceled before they are started by either the client or freelancer.</li>
                <li>Once a project is officially started, cancellation is only allowed under exceptional circumstances, subject to review by Workbridg.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Refunds</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>All client payments are held in escrow until project completion.</li>
                <li>Refunds will be processed according to the following:
                  <ol className="list-decimal pl-6 mt-2 space-y-2">
                    <li>If the project is canceled before starting, the client will receive a full refund.</li>
                    <li>If the project is canceled after starting, refunds are determined by Workbridg based on work completed, milestone agreements, and platform oversight.</li>
                  </ol>
                </li>
                <li>Service charge may be deducted where applicable.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Payment Release</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Freelancer payment is released only after project completion and client approval.</li>
                <li>Platform fees are automatically deducted before payout.</li>
                <li>Workbridg oversees communication to ensure smooth release of funds.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Disputes & Support</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>In case of disputes, clients or freelancers can contact Workbridg support.</li>
                <li>Workbridg will review project details, communications, and completed work to determine fair resolution.</li>
                <li>All decisions made by Workbridg regarding refunds or cancellations are final and binding.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions regarding refunds or cancellations, email: 
                <a href="mailto:workbridg.team@gmail.com" className="text-blue-600 hover:underline ml-1">
                  workbridg.team@gmail.com
                </a>
              </p>
            </section>

            <div className="pt-4 border-t border-gray-200 mt-8">
              <p className="text-gray-600 text-sm">
                If you have any questions about our Refund & Cancellation Policy, please contact us at{' '}
                <a href="mailto:workbridg.team@gmail.com" className="text-blue-600 hover:underline">
                  workbridg.team@gmail.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
