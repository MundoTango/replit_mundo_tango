const Button = ({ text, onClick, className, ...other }) => {
  return (
    <button
      className={`bg-btn-color rounded-xl text-white px-10 font-bold text-sm md:text-base ${className} `}
      onClick={onClick}
      {...other}
    >
      {text}
    </button>
  );
};

export default Button;
