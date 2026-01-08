import React, { useState, useEffect } from 'react';
import { LogOut, Package, Heart, Settings, MapPin, User as UserIcon, Shield, CreditCard, ShoppingBag, Download, AlertCircle, Edit3, Save, Map, Phone } from 'lucide-react';
import { useStore } from '../store';
import { AdminDashboard } from './AdminDashboard';
import { Order } from '../types';

type DashboardView = 'overview' | 'orders' | 'address' | 'settings';

export const Dashboard: React.FC = () => {
  const { user, setUser, setCurrentView, orders, logout } = useStore();
  const [view, setView] = useState<DashboardView>('overview');
  const [addressForm, setAddressForm] = useState(user?.address || '');
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // Filter orders for the current user
  const userOrders = orders.filter(o => 
      (user?.phone && o.phone === user.phone) || 
      (user?.email && o.customerName === user.name) // Fallback for demo if phone doesn't match perfectly, ideally match by ID/Phone
  ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!user) return null;

  // Render Admin Dashboard if role is admin
  if (user.role === 'admin') {
      return <AdminDashboard />;
  }

  const handleLogout = async () => {
    await logout();
    // CurrentView update is handled in logout, but ensuring flow is clean
  };

  const handleUpdateAddress = () => {
      if (user) {
          setUser({ ...user, address: addressForm });
          setIsAddressEditing(false);
      }
  };

  const handleDownloadInvoice = (order: Order) => {
      setPrintingOrder(order);
      // Wait for render then print
      setTimeout(() => {
          const element = document.getElementById('customer-invoice-template');
          if (element && (window as any).html2pdf) {
              const opt = {
                  margin: 0,
                  filename: `invoice_${order.id}.pdf`,
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { scale: 2, useCORS: true },
                  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
              };
              (window as any).html2pdf().set(opt).from(element).save().then(() => setPrintingOrder(null));
          } else {
              setPrintingOrder(null);
              alert('PDF Generator not ready.');
          }
      }, 500);
  };

  return (
    <div className="min-h-[85vh] bg-gray-50 pb-20 relative">
        {/* Profile Header */}
        <div className="bg-white pb-6 pt-4 px-4 rounded-b-[2.5rem] shadow-sm border-b border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-brand-50 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2"></div>
             <div className="absolute top-0 left-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/2"></div>
            
            <div className="flex flex-col items-center text-center relative z-10 animate-fade-up">
                <div className="w-20 h-20 bg-gradient-to-tr from-brand-500 to-brand-400 rounded-full p-1 shadow-lg mb-3">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                         <span className="text-3xl font-black text-brand-600">{user.name.charAt(0)}</span>
                    </div>
                </div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{user.name}</h1>
                <p className="text-gray-500 text-xs font-medium mb-3">{user.phone || user.email}</p>
                
                {/* Stats Row */}
                <div className="flex items-center gap-6 mt-2">
                    <div className="text-center">
                        <span className="block text-lg font-black text-brand-600 leading-none">{userOrders.length}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Orders</span>
                    </div>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <div className="text-center">
                        <span className="block text-lg font-black text-brand-600 leading-none">0</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Points</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 mt-6">
            <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto no-scrollbar">
                <NavButton active={view === 'overview'} onClick={() => setView('overview')} label="Overview" icon={LayoutDashboard} />
                <NavButton active={view === 'orders'} onClick={() => setView('orders')} label="My Orders" icon={ShoppingBag} />
                <NavButton active={view === 'address'} onClick={() => setView('address')} label="Address" icon={MapPin} />
                <NavButton active={view === 'settings'} onClick={() => setView('settings')} label="Settings" icon={Settings} />
            </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 mt-6 pb-10">
            {/* OVERVIEW TAB */}
            {view === 'overview' && (
                <div className="space-y-4 animate-fade-up">
                    {/* Recent Order */}
                    {userOrders.length > 0 && (
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">Recent Order</h3>
                                    <p className="text-xs text-gray-500">{userOrders[0].date}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                    userOrders[0].status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                                    userOrders[0].status === 'processing' ? 'bg-blue-50 text-blue-700' :
                                    userOrders[0].status === 'delivered' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>{userOrders[0].status}</span>
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                                    <ShoppingBag className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Order #{userOrders[0].id}</p>
                                    <p className="text-xs text-gray-500">{userOrders[0].items.length} Items • ৳{userOrders[0].total.toLocaleString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setView('orders')} className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors">
                                View All Orders
                            </button>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setView('address')} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:border-brand-200 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">Manage Address</span>
                        </button>
                        <button className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:border-brand-200 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Heart className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">My Wishlist</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ORDERS TAB */}
            {view === 'orders' && (
                <div className="space-y-4 animate-fade-up">
                    {userOrders.length === 0 ? (
                        <div className="text-center py-10">
                            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-gray-900 font-bold mb-2">No Orders Yet</h3>
                            <button onClick={() => setCurrentView('shop')} className="text-brand-600 font-bold text-xs hover:underline">Start Shopping</button>
                        </div>
                    ) : (
                        userOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">Order #{order.id}</p>
                                        <p className="text-[10px] text-gray-500">{order.date}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                        order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>{order.status}</span>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-3 mb-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-3">
                                                <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 p-1 shrink-0">
                                                    <img src={item.image} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</p>
                                                    <p className="text-[10px] text-gray-500">{item.quantity} x ৳{item.price.toLocaleString()}</p>
                                                </div>
                                                <p className="text-xs font-bold text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Total Amount</p>
                                            <p className="text-lg font-black text-brand-600">৳{order.total.toLocaleString()}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDownloadInvoice(order)}
                                            disabled={printingOrder !== null}
                                            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-70"
                                        >
                                            {printingOrder?.id === order.id ? 'Generating...' : <>Download Invoice <Download className="w-3 h-3" /></>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ADDRESS TAB */}
            {view === 'address' && (
                <div className="animate-fade-up">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Map className="w-5 h-5 text-gray-400" /> Delivery Address
                            </h3>
                            {!isAddressEditing && (
                                <button onClick={() => setIsAddressEditing(true)} className="text-brand-600 text-xs font-bold hover:underline flex items-center gap-1">
                                    <Edit3 className="w-3 h-3" /> Edit
                                </button>
                            )}
                        </div>

                        {isAddressEditing ? (
                            <div className="space-y-4">
                                <textarea 
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-brand-500 outline-none resize-none"
                                    rows={3}
                                    placeholder="House, Road, Area, City..."
                                    value={addressForm}
                                    onChange={e => setAddressForm(e.target.value)}
                                />
                                <div className="flex gap-3">
                                    <button onClick={handleUpdateAddress} className="flex-1 bg-brand-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2">
                                        <Save className="w-3 h-3" /> Save Address
                                    </button>
                                    <button onClick={() => setIsAddressEditing(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-3">
                                <div className="p-2 bg-white rounded-full shadow-sm text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800 leading-relaxed">
                                        {user.address || <span className="text-gray-400 italic">No address saved yet.</span>}
                                    </p>
                                    {user.phone && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /> {user.phone}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SETTINGS TAB */}
            {view === 'settings' && (
                <div className="animate-fade-up space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left">
                            <span className="text-sm font-medium text-gray-700">Change Password</span>
                            <Edit3 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left">
                            <span className="text-sm font-medium text-gray-700">Notification Preferences</span>
                            <Settings className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="w-full bg-white text-red-500 font-bold py-4 rounded-2xl shadow-sm border border-red-50 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Log Out</span>
                    </button>
                    
                    <p className="text-center text-[10px] text-gray-300 mt-6">
                        App Version 1.2.0 • Build 2023.11
                    </p>
                </div>
            )}
        </div>

        {/* Hidden Invoice Template for Printing */}
        {printingOrder && (
            <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
                <div id="customer-invoice-template" className="w-[210mm] min-h-[297mm] bg-white p-10 text-slate-800">
                    <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase">INVOICE</h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">Zazzba Tech Zone</p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-lg font-bold text-slate-800">#{printingOrder.id}</p>
                            <p className="text-xs text-slate-500">{printingOrder.date}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Billed To</p>
                        <h2 className="text-lg font-bold text-slate-900">{printingOrder.customerName}</h2>
                        <p className="text-sm text-slate-600">{printingOrder.phone}</p>
                        <p className="text-sm text-slate-600">{printingOrder.address}</p>
                    </div>

                    <table className="w-full mb-8 text-sm">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                                <th className="py-2 px-3 text-left font-bold">Item</th>
                                <th className="py-2 px-3 text-center font-bold">Qty</th>
                                <th className="py-2 px-3 text-right font-bold">Price</th>
                                <th className="py-2 px-3 text-right font-bold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {printingOrder.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-50">
                                    <td className="py-3 px-3 font-medium">{item.name}</td>
                                    <td className="py-3 px-3 text-center text-slate-500">{item.quantity}</td>
                                    <td className="py-3 px-3 text-right text-slate-600">{item.price.toLocaleString()}</td>
                                    <td className="py-3 px-3 text-right font-bold">{(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mb-12">
                        <div className="w-1/2 space-y-2 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>৳{Math.max(0, printingOrder.total - (printingOrder.deliveryCharge || 0)).toLocaleString()}</span>
                            </div>
                            {printingOrder.deliveryCharge && printingOrder.deliveryCharge > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Delivery</span>
                                    <span>+ ৳{printingOrder.deliveryCharge.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-black text-lg text-slate-900 pt-2 border-t border-slate-200">
                                <span>Total</span>
                                <span>৳{printingOrder.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-400 mt-auto pt-8 border-t border-slate-100">
                        <p>Thank you for shopping with Zazzba Tech Zone.</p>
                        <p>For support, call 01953319995</p>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

const LayoutDashboard: React.FC<{className?: string}> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;

const NavButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: any }> = ({ active, onClick, label, icon: Icon }) => (
    <button 
        onClick={onClick}
        className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-6 rounded-lg transition-all min-w-[90px] whitespace-nowrap ${active ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-gray-50'}`}
    >
        <Icon className={`w-5 h-5 ${active ? 'fill-brand-200' : ''}`} />
        <span className="text-[10px] font-bold">{label}</span>
    </button>
);