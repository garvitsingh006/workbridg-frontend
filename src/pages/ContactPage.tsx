import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";
import { useState } from "react";

export default function ContactPage() {
    const [isSending, setIsSending] = useState(false);
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const name = formData.get("name")?.toString().trim();
        const email = formData.get("email")?.toString().trim();
        const message = formData.get("message")?.toString().trim();

        if (isSending) return;

        if (!name || !email || !message) {
            toast.error("Please fill all fields");
            return;
        }

        emailjs
            .sendForm(
                "service_0iuiyi7",
                "template_r81geab",
                form,
                "6IIxgSBj3WyclHxfj"
            )
            .then(() => {
                toast.success("Message sent!");
                form.reset();
            })
            .catch(() => {
                toast.error("Something went wrong.");
            })
            .finally(() => setIsSending(false));
    };
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 mt-10">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Contact Us
                    </h1>
                    <p className="text-lg text-gray-600">
                        Have questions or need assistance? Reach out to our
                        team.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="h-full rounded-2xl shadow-lg">
                            <CardContent className="p-8">
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-semibold mb-2">
                                            Get in Touch
                                        </h2>
                                        <p className="text-gray-600">
                                            We'd love to hear from you. Send us
                                            a message and we'll respond as soon
                                            as possible.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-4">
                                            <div className="shrink-0">
                                                <svg
                                                    className="h-6 w-6 text-gray-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    Email Us
                                                </h3>
                                                <a
                                                    href="mailto:workbridg.team@gmail.com"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    workbridg.team@gmail.com
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card className="h-full rounded-2xl shadow-lg">
                            <CardContent className="p-8">
                                <h2 className="text-2xl font-semibold mb-6">
                                    Send us a Message
                                </h2>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                    <div>
                                        <div>
                                            <label
                                                htmlFor="message"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Message
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={4}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Your message"
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSending}
                                            className="w-full bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                                        >
                                            Send Message
                                        </button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
