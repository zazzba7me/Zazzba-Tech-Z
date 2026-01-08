import React from "react";
import { StoreProvider, useStore } from "./store";
import { Header } from "./components/Header";
import { SearchSection } from "./components/SearchSection";
import { QuickActionGrid } from "./components/QuickActionGrid";
import { FlashSaleSection } from "./components/FlashSaleSection";
import { Categories } from "./components/Categories";
import { NewArrivals } from "./components/NewArrivals";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { Modals } from "./components/Modals";
import { Dashboard } from "./components/Dashboard";
import { POS } from "./components/POS";
import { Shop } from "./components/Shop";
import { Hero } from "./components/Hero";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsConditions } from "./components/TermsConditions";
import { WhatsAppButton } from "./components/WhatsAppButton";

const MainContent: React.FC = () => {
  const { currentView, searchQuery } = useStore();

  // If POS view is active, render only POS (fullscreen experience)
  if (currentView === 'pos') {
      return <POS />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />
      
      {/* Added pb-20 to prevent content from being hidden behind mobile bottom nav */}
      <main className="flex-grow pb-20 md:pb-0">
        {currentView === 'home' && (
            <>
            <SearchSection />
            
            {!searchQuery && (
              <div className="animate-fade-up">
                <Hero />
                <QuickActionGrid />
                <Categories />
                <FlashSaleSection />
              </div>
            )}
            
            {/* NewArrivals handles both "New Arrivals" list and "Search Results" list */}
            <NewArrivals />
            </>
        )}

        {currentView === 'dashboard' && <Dashboard />}
        
        {currentView === 'shop' && <Shop />}
        
        {currentView === 'privacy' && <PrivacyPolicy />}
        
        {currentView === 'terms' && <TermsConditions />}
      </main>

      {/* Footer is hidden on mobile home to reduce clutter, or keep it but ensure padding */}
      <div className="mb-16 md:mb-0">
          <Footer />
      </div>

      <MobileBottomNav />
      <CartDrawer />
      <Modals />
      <WhatsAppButton />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
};

export default App;