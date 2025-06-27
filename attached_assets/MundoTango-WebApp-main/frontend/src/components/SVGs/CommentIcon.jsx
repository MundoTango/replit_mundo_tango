const CommentIcon = ({ color = "#94A3B8" }) => {
  return (
    <svg
      width="20"
      height="18"
      viewBox="0 0 20 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 17.0001L2.3 13.1001C1.17644 11.4384 0.769993 9.47049 1.15622 7.56238C1.54244 5.65427 2.69506 3.93575 4.39977 2.72635C6.10447 1.51696 8.24526 0.898977 10.4241 0.987319C12.6029 1.07566 14.6715 1.86431 16.2453 3.20664C17.819 4.54896 18.7909 6.35362 18.9801 8.28506C19.1693 10.2165 18.563 12.1433 17.2739 13.7072C15.9848 15.2711 14.1007 16.3657 11.9718 16.7874C9.84293 17.2092 7.6142 16.9294 5.7 16.0001L1 17.0001Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 9V9.01"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 9V9.01"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 9V9.01"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CommentIcon;
