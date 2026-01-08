import React from "react";
import { FileText, AlertTriangle, Truck, RotateCcw, ArrowLeft } from "lucide-react";
import { useStore } from "../store";

export const TermsConditions: React.FC = () => {
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
                    <div className="bg-gray-900 p-8 text-white relative overflow-hidden">
                         <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
                         <div className="relative z-10">
                            <h1 className="text-3xl font-black mb-2">Terms & Conditions</h1>
                            <p className="text-gray-400 font-medium">Please read these terms carefully before using our service.</p>
                         </div>
                    </div>

                    <div className="p-8 space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg"><FileText className="w-5 h-5"/></div>
                                <h2 className="text-xl font-bold text-gray-900">1. Introduction</h2>
                            </div>
                            <p className="text-sm">
                                Welcome to Zazzba Tech Zone. By accessing this website, we assume you accept these terms and conditions. Do not continue to use Zazzba Tech Zone if you do not agree to take all of the terms and conditions stated on this page.
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><AlertTriangle className="w-5 h-5"/></div>
                                <h2 className="text-xl font-bold text-gray-900">2. Warranty Policy</h2>
                            </div>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                <li>We provide official warranty for specific products as mentioned in the product description.</li>
                                <li>Warranty is void if the product seal is broken, physically damaged, burnt, or damaged by water/liquid.</li>
                                <li>To claim warranty, the customer must present the original invoice.</li>
                                <li>Warranty service duration depends on the brand's authorized service center timeline (usually 7-21 days).</li>
                            </ul>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><RotateCcw className="w-5 h-5"/></div>
                                <h2 className="text-xl font-bold text-gray-900">3. Return & Refund Policy</h2>
                            </div>
                             <ul className="list-disc pl-5 space-y-2 text-sm">
                                <li>You can return a product within 3 days if it has manufacturing defects.</li>
                                <li>No cash refunds are allowed. You may exchange the product or get store credit.</li>
                                <li>Change of mind is not applicable for return or exchange.</li>
                                <li>Products must be returned in their original packaging with all accessories.</li>
                            </ul>
                        </section>

                         <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Truck className="w-5 h-5"/></div>
                                <h2 className="text-xl font-bold text-gray-900">4. Delivery Policy</h2>
                            </div>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                <li>Inside Dhaka delivery takes 24-48 hours.</li>
                                <li>Outside Dhaka delivery takes 2-5 days depending on the location.</li>
                                <li>Delivery charges are non-refundable.</li>
                                <li>We are not responsible for delays caused by courier services or natural disasters.</li>
                            </ul>
                        </section>

                         <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Product Pricing & Availability</h2>
                            <p className="text-sm">
                                Prices are subject to change without prior notice. While we strive to provide accurate pricing information, errors may occur. In the event that an item is listed at an incorrect price, we reserve the right to cancel any orders placed for that item.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};