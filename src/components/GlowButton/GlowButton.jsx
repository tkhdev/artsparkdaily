import './GlowButton.css'

const GlowButton = ({ children, className = "", ...props }) => {
  return (
    <button
      className={
        "glow-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg flex-1 flex justify-center items-center space-x-2 transition-all " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
};

export default GlowButton;
