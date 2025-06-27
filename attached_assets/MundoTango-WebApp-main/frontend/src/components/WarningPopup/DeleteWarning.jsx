import CrossIcon from "../SVGs/CrossIcon";

export default function DeleteWarning({
  onClick,
  handleClose,
  message,
  title,
}) {
  return (
    <div className="px-6 py-4 space-y-3">
      {title && (
        <div className="flex justify-between">
          <div className="font-bold text-gray-text-color text-2xl">{title}</div>
          <div
            onClick={handleClose}
            className="cursor-pointer bg-[#ECECEC] flex items-center justify-center rounded-full w-6 h-6"
          >
            <CrossIcon />
          </div>
        </div>
      )}

      <div className="px-1 text-lg text-gray-text-color font-medium">
        {message}
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => {
            onClick();
            handleClose();
          }}
          className="bg-btn-color text-white w-28 h-10 rounded-lg"
        >
          Yes
        </button>
        <button onClick={handleClose} className="border w-28 h-10 rounded-lg">
          No
        </button>
      </div>
    </div>
  );
}
