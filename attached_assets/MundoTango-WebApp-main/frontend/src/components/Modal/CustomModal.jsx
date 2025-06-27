import { Box, Modal } from "@mui/material";

export default function ModelComponent({
  open,
  handleClose,
  children,
  title,
  description,
  bgColor,
  width,
  className,
}) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: width,
    bgcolor: bgColor ? bgColor : "background.paper",
    border: "none",
    boxShadow: 24,
    borderRadius: 4,
    outline: "none",
    maxHeight: "92vh",
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style} className={className}>{children}</Box>
    </Modal>
  );
}
