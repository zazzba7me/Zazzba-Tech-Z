import React from "react";
import { Shield, Lock, Eye, Server, ArrowLeft } from "lucide-react";
import { useStore } from "../store";

export const PrivacyPolicy: React.FC = () => {
    const { setCurrentView } = useStore();

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-4">
            <div className="max-w-4xl mx-auto px-4">
                <button 
                    onClick={() => setCurrentView('home')} 
                    className="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors mb-6 font-bold text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-brand-600 p-8 text-white relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                         <div className="relative z-10">
                            <h1 className="text-3xl font-black mb-2">Privacy Policy</h1>
                            <p className="text-brand-100 font-medium">Last updated: {new Date().toLocaleDateString()}</p>
                         </div>
                    </div>

                    <div className="p-8 space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Shield className="w-5 h-5"/></div>
                                <h2 className="text-xl font-bold text-gray-900">1. Information We Collect</h2>
                            </div>
                            <p className="text-sm mb-3">
                                At Zazzba Tech Zone, we collect information to provide better services to our users. This includes:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                <li><strong>Personal Information:</strong> Name, address, phone number, and email address when you place an order or register.</li>
                                <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products you have purchased from us.</li>
                                <li><strong>Technical Data:</strong> Internet protocol (IP) address, your login data, browser type and version.</li>
                            </ul>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Eye className="w-5 h-5"/></div>
                                <h2 className="text-xl font-bold text-gray-900">2. How We Use Your Information</h2>
                            </div>
                            <p className="text-sm">We use the information we collect in various ways, including to:</p>
                            <ul className="list-disc pl-5 space-y-2 text-sm mt-3">
                                <li>Process your orders and manage your account.</li>
                                <li>Improve, personalize, and expand our website.</li>
                                <li>Understand and analyze how you use our website.</li>
                                <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates.</li>
                                <li>Send you emails and SMS regarding order status.</li>
                            </ul>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Lock className="w-5 h-5"/></div>
                                <h2 className="text-xl font-bold text-gray-900">3. Data Security</h2>
                            </div>
                            <p className="text-sm">
                                We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
                            </p>
                        </section>

                         <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Server className="w-5 h-5"/></div>
                                <h2 className="text-xl font-bold text-gray-900">4. Third Party Services</h2>
                            </div>
                            <p className="text-sm">
                                We may employ third-party companies and individuals due to the following reasons:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-sm mt-3">
                                <li>To facilitate our Service (e.g., Payment Gateways like bKash, Nagad).</li>
                                <li>To provide the Service on our behalf (e.g., Courier Services).</li>
                            </ul>
                            <p className="text-sm mt-2">
                                We want to inform our Service users that these third parties have access to your Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.
                            </p>
                        </section>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-2">Contact Us</h3>
                            <p className="text-sm text-gray-600 mb-4">If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.</p>
                            <p className="text-sm font-medium text-brand-600">Email: support@zazzba.com</p>
                            <p className="text-sm font-medium text-brand-600">Phone: 01953319995</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};