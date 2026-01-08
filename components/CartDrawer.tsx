import React from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useStore } from '../store';

export const CartDrawer: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen, openCheckout } = useStore();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    openCheckout(cart);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-[slideIn_0.3s_ease-out]">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-brand-500 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-bold">Your Cart</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p className="font-medium">Your cart is empty</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-brand-500 font-semibold hover:underline"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-20 h-20 bg-white rounded-md p-1 shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
                    <p className="text-brand-600 font-bold text-sm">৳{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-md px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-gray-500 hover:text-brand-500 disabled:opacity-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-gray-500 hover:text-brand-500"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="text-2xl font-bold text-brand-600">৳{cartTotal.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-brand-500 text-white font-bold py-3.5 rounded-lg hover:bg-brand-600 active:scale-[0.98] transition-all shadow-lg shadow-brand-500/30"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};