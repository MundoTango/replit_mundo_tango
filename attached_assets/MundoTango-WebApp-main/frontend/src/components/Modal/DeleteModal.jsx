import Button from "../Buttons/Button";
import SpinnerLoading from "../Loadings/Spinner";
import CrossIcon from "../SVGs/CrossIcon";
import ModelComponent from "./CustomModal";

const DeleteModal = ({
  open,
  handleClose,
  onDecline,
  isLoading,
  text,
  onAccept,
}) => {
  return (
    <ModelComponent open={open} handleClose={handleClose}>
      <div className="px-8 py-5 my-4">
        <div className="absolute right-5 top-5">
          <CrossIcon className="cursor-pointer" onClick={handleClose} />
        </div>

        <div>
          <div className="font-bold text-xl">Delete Confirmation</div>
          <div className="text-light-gray-color text-base">{text}</div>
        </div>
        <div className="flex items-center justify-between gap-4 mt-5">
          {onDecline && (
            <Button
              text={"NO"}
              className={
                "w-full rounded-xl text-white h-10 bg-tag-color text-sm font-medium"
              }
              onClick={onDecline}
            />
          )}
          <Button
            disabled={isLoading}
            text={isLoading ? <SpinnerLoading /> : "YES"}
            className={
              "w-full rounded-xl text-white h-10 text-sm font-medium flex items-center justify-center"
            }
            onClick={onAccept}
          />
        </div>
      </div>
    </ModelComponent>
  );
};

export default DeleteModal;
