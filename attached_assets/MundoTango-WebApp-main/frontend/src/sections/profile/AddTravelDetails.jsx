const AddTravelDetails = ({ onClick }) => {
  return (
    <button
      className=" text-btn-color px-6 md:px-10 py-3 rounded-xl font-bold text-base"
      onClick={onClick}
    >
      + Add Travel Details
    </button>
  );
};

export default AddTravelDetails;
