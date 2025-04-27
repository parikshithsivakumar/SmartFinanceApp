import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: "primary" | "blue" | "yellow" | "green" | "red";
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return "bg-primary-100 text-primary-600";
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "yellow":
        return "bg-yellow-100 text-yellow-600";
      case "green":
        return "bg-green-100 text-green-600";
      case "red":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${getColorClasses()}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
