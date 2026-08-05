/*
========================================================

Project : Emerald Heights CRM

File : MainLayout.tsx

Purpose :

पूरी Website का Common Layout

इस Layout में हमेशा रहेगा

✔ Sidebar
✔ Navbar
✔ Main Content

सिर्फ Main Content हर Page पर बदलेगा।

========================================================
*/

import type { ReactNode } from "react";

// Left Sidebar
import Sidebar from "./Sidebar";

// Top Navbar
import Navbar from "../components/dashboard/Navbar";

// MainLayout को कौन-कौन सी Properties मिलेंगी
interface MainLayoutProps {

  // जिस Page को दिखाना है
  children: ReactNode;
}

// Main Layout Component
function MainLayout({ children }: MainLayoutProps) {

  return (

    // पूरी Screen को दो हिस्सों में बांट रहे हैं
    <div className="flex min-h-screen bg-gray-100">

      {/* Left Sidebar */}
      <Sidebar />

      {/* Right Side */}
      <div className="flex-1">

        {/* Top Navbar */}
        <Navbar />

        {/* हर Page का Content */}
        <main className="p-6">

          {children}

        </main>

      </div>

    </div>

  );

}

export default MainLayout;