import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-3">
        <h1 className="text-2xl font-semibold">Registration is disabled</h1>
        <p className="text-sm text-muted-foreground">
          Public registration is not available. Only an administrator can create accounts and share
          login credentials.
        </p>
        <p>
          <Link to="/login" className="text-primary underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
