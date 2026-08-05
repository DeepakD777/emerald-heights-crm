// ======================================================
// StatsCard Component
// ======================================================
// यह Component Dashboard के ऊपर दिखाई देने वाले
// Statistics Cards बनाने के लिए है।
//
// इसे हम 4 बार Use करेंगे।
// हर बार अलग Title, Value, Icon और Color देंगे।
// ======================================================

import type { ReactNode } from "react";

// Component को कौन-कौन सी Values मिलेंगी
interface StatsCardProps {

  // Card का Title
  title: string;

  // बड़ी Value
  value: string;

  // छोटा Description
  subtitle: string;

  // Icon
  icon: ReactNode;

  // Icon Background Color
  color: string;
}

function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: StatsCardProps) {
  return (

    // पूरा Card
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition">

      {/* ऊपर वाला Section */}
      <div className="flex justify-between items-center">

        {/* Title */}
        <div>

          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2 text-gray-800">
            {value}
          </h2>

        </div>

        {/* Icon */}
        <div
          className={`h-14 w-14 rounded-xl flex items-center justify-center text-white ${color}`}
        >
          {icon}
        </div>

      </div>

      {/* नीचे Description */}
      <p className="text-sm text-gray-500 mt-5">
        {subtitle}
      </p>

    </div>
  );
}

export default StatsCard;