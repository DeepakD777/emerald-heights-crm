interface FlatCardProps {
  number: string;
  area: string;
  status: "available" | "hold" | "booked";
}

function FlatCard({
  number,
  area,
  status,
}: FlatCardProps) {

  const colors = {
    available: "bg-green-100 border-green-400",
    hold: "bg-yellow-100 border-yellow-400",
    booked: "bg-red-100 border-red-400",
  };

  return (
    <div
      className={`
        h-24
        rounded-lg
        border
        flex
        flex-col
        justify-center
        items-center
        cursor-pointer
        transition
        hover:scale-105
        ${colors[status]}
      `}
    >

      <h3 className="font-bold text-xl">
        {number}
      </h3>

      <p className="text-gray-600 text-sm">
        {area}
      </p>

    </div>
  );
}

export default FlatCard;