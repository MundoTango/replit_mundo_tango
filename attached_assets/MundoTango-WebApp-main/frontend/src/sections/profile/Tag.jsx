const Tag = ({ name, className }) => {
  return <span className={`tags ${className}`}>{name}</span>;
};

export default Tag;
