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
  value: string | number;

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
    <div
      className="
    rounded-xl
    border
    border-gray-200
    bg-white
    p-4
    shadow-sm
    transition
    hover:shadow-lg
    sm:p-5
    lg:p-6
  "
    >

      {/* ऊपर वाला Section */}
      <div className="flex min-w-0 items-center justify-between gap-3">

        {/* Title */}
        <div>

          <p className="text-xs text-gray-500 sm:text-sm">
            {title}
          </p>

          <h2 className="mt-1 text-2xl font-bold text-gray-800 sm:mt-2 sm:text-3xl">
            {value}
          </h2>

        </div>

        {/* Icon */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white sm:h-12 sm:w-12 lg:h-14 lg:w-14 ${color}`}
        >
          {icon}
        </div>

      </div>

      {/* नीचे Description */}
      <p className="mt-3 text-xs text-gray-500 sm:mt-4 sm:text-sm lg:mt-5">
        {subtitle}
      </p>

    </div>
  );
}

export default StatsCard;