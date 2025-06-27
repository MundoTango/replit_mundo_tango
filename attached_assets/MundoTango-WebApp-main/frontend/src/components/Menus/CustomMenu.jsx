import { Menu } from "@mui/material";

const CustomMenu = ({ handleClose, anchorEl, open, children }) => {
  return (
    <Menu
      sx={{
        "& .MuiMenu-paper": {
          background: "#FFFFFF",
          borderRadius: 5,
          border: "1px solid lightgrey",
        },
        boxShadow: 0,
      }}
      elevation={0}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
    >
      {children}
    </Menu>
  );
};

export default CustomMenu;
