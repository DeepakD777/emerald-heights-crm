import {
  Building2,
  CheckCircle,
  Clock3,
  AlertCircle,
} from "lucide-react";

function FloorPreview() {
  const floors = [
    {
      name: "Ground Floor",
      occupied: 95,
      color: "bg-green-500",
      icon: <CheckCircle size={18} className="text-green-600" />,
    },
    {
      name: "First Floor",
      occupied: 72,
      color: "bg-blue-500",
      icon: <Clock3 size={18} className="text-blue-600" />,
    },
    {
      name: "Second Floor",
      occupied: 38,
      color: "bg-orange-500",
      icon: <AlertCircle size={18} className="text-orange-600" />,
    },
    {
      name: "Third Floor",
      occupied: 100,
      color: "bg-green-600",
      icon: <CheckCircle size={18} className="text-green-600" />,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">

      <div className="flex items-center gap-2 mb-6">
        <Building2 className="text-green-600" size={22} />
        <h2 className="text-xl font-bold text-gray-800">
          Floor Preview
        </h2>
      </div>

      <div className="space-y-5">
        {floors.map((floor) => (
          <div key={floor.name}>

            <div className="flex justify-between items-center mb-2">

              <div className="flex items-center gap-2">
                {floor.icon}
                <span className="font-medium text-gray-700">
                  {floor.name}
                </span>
              </div>

              <span className="text-sm font-semibold text-gray-600">
                {floor.occupied}%
              </span>

            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full">

              <div
                className={`${floor.color} h-2 rounded-full`}
                style={{
                  width: `${floor.occupied}%`,
                }}
              />

            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

export default FloorPreview;