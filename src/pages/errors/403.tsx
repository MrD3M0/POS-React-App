import { AlertTriangle } from "lucide-react";
import { Link } from "react-router";


function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="text-destructive" size={64} />
      <h1 className="text-3xl font-bold">403 Forbidden</h1>
      <p className="text-gray-500">You don't have permission to access this page.</p>
      <Link to="/dashboard" className="mt-2 px-4 py-2 bg-primary rounded text-white hover:bg-secondary">Back to Dashboard</Link>
    </div>
  );
}

export default ForbiddenPage;
