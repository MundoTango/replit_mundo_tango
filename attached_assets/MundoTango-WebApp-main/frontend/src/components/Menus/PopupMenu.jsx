import CustomMenu from "@/components/Menus/CustomMenu";
import { MenuItem } from "@mui/material";
import React, { useEffect } from "react";

const PopupMenu = ({ anchorEl, handleClose, open, menuList }) => {
  const menuClass = `font-[Gilroy] px-3 flex gap-3 items-center m-1 justify-center font-semibold text-gray-text-color`;

  return (
    <CustomMenu anchorEl={anchorEl} handleClose={handleClose} open={open}>
      {!!menuList?.length &&
        menuList.map(({ title, onClick }, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              if (onClick) {
                onClick();
              }
            }}
          >
            <div className={menuClass}>{title}</div>
          </MenuItem>
        ))}
    </CustomMenu>
  );
};

export default PopupMenu;
