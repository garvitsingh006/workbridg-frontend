import { motion } from 'framer-motion';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4  mt-10">
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
          className="p-8 md:p-12 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Workbridg is a managed freelancing platform connecting clients with verified freelancers. By using our platform, you agree to these Terms & Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>Clients:</strong> Provide accurate project details and feedback. Approve work only after verification.</li>
                <li><strong>Freelancers:</strong> Deliver work as agreed and maintain professional communication.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Payments & Escrow</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>All client payments are held in escrow until project completion.</li>
                <li>Workbridg deducts platform fees and service charges before releasing payment to freelancers.</li>
                <li>Workbridg is not liable for delays due to banking or technical issues.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Platform Oversight</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Workbridg may oversee project communications to ensure smooth progress.</li>
                <li>Users may contact Workbridg for support or dispute resolution.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Work delivered belongs to the client after payment release.</li>
                <li>Workbridg is not responsible for intellectual property disputes between users.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Prohibited Activities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Fraud, harassment, illegal activity, or malicious content is strictly prohibited.</li>
                <li>Workbridg may suspend or terminate accounts for violations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Workbridg provides platform services only.</li>
                <li>We are not responsible for disputes, delays, or unsatisfactory work beyond platform oversight.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Terms are governed by Indian law.</li>
                <li>Disputes fall under local court jurisdiction.</li>
              </ul>
            </section>

            <section>
              <p className="text-gray-700 leading-relaxed font-medium">
                Contact: <a href="mailto:workbridg.team@gmail.com" className="text-blue-600 hover:underline">workbridg.team@gmail.com</a>
              </p>
            </section>

            <div className="pt-4 border-t border-gray-200 mt-8">
              <p className="text-gray-600 text-sm">
                If you have any questions about these Terms & Conditions, please contact us at{' '}
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
