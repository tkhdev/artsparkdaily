import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function HowItWorksStep({ icon, title, description, iconBgClass }) {
  return (
    <div className="text-center">
      <div className={`h-20 w-20 rounded-full ${iconBgClass} mx-auto flex items-center justify-center mb-6`}>
        <FontAwesomeIcon icon={icon} className="text-3xl text-white" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}