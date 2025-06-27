import React from "react";
import { Modal } from "react-bootstrap";
import { MdSkipNext } from "react-icons/md";
import AdBanner from "./AdBanner";

const AdModal = ({ setStripeMode, darkMode }) => {
  return (
    <Modal.Body
      style={{ height: "400px" }}
      className={darkMode ? "dark-mode" : "light-mode"}
    >
      <button
        className={`position-absolute top-50 end-0 ${
          darkMode ? "bg-black text-white" : " bg-white text-black"
        } mt-5 me-4 d-flex align-items-center border-0 outline-0 px-2 py-1 rounded-pill fs-8`}
        onClick={() => {
          setStripeMode(true);
        }}
      >
        skip ad <MdSkipNext />
      </button>
      <AdBanner
        dataAdFormat="auto"
        dataFullWidthResponsive={true}
        dataAdSlot={process.env.TEST_ADD_SLOT_HORIZANTAl}
        maxheight={"370px"}
      />
    </Modal.Body>
  );
};

export default AdModal;
