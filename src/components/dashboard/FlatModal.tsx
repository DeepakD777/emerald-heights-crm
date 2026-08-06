import Modal from "./Modal";

interface FlatModalProps {
  isOpen: boolean;
  onClose: () => void;
  flat: {
    number: string;
    area: string;
    status: string;
  } | null;
}

function FlatModal({
  isOpen,
  onClose,
  flat,
}: FlatModalProps) {

  if (!flat) return null;

  return (

    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Flat ${flat.number}`}
    >

      <div className="space-y-4">

        <div>

          <p className="text-sm text-gray-500">
            Flat Number
          </p>

          <p className="text-lg font-semibold">
            {flat.number}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Area
          </p>

          <p className="text-lg font-semibold">
            {flat.area}
          </p>

        </div>

        <div>

          <p className="text-sm text-gray-500">
            Status
          </p>

          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-medium
            ${
              flat.status === "available"
                ? "bg-green-100 text-green-700"
                : flat.status === "booked"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {flat.status}
          </span>

        </div>

        <div className="border-t pt-4 flex gap-3">

          <button className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
            Edit Flat
          </button>

          <button className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700">
            Booking
          </button>

        </div>

      </div>

    </Modal>

  );
}

export default FlatModal;