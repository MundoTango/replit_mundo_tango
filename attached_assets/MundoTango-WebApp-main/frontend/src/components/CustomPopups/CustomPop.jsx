export default function CustomPopup({ children }) {
  return (
    <div className="absolute animate-fade-down w-[300px] top-5 left-[-170px] right-0 z-50" id="view-dialogue">
      {children}
    </div>
  );
}
