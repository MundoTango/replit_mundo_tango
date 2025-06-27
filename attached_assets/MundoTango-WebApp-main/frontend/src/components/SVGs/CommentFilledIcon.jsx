const CommentFilledIcon = ({ color = "#94A3B8" }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.64651 13.61L1.75651 15.5V12.0358C0.714844 10.8192 0.0898438 9.27 0.0898438 7.58333C0.0898438 3.67167 3.44818 0.5 7.58984 0.5C11.7315 0.5 15.0898 3.67167 15.0898 7.58333C15.0898 11.495 11.7315 14.6667 7.58984 14.6667C6.20486 14.6711 4.84371 14.3064 3.64651 13.61Z"
        fill={color}
      />
    </svg>
  );
};

export default CommentFilledIcon;
