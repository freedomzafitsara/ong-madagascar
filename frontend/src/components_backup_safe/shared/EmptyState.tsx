interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({ 
  title = "Aucune donnée", 
  description = "Aucun élément trouvé",
  icon = "📭",
  action
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
