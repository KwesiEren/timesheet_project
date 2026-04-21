import { Navigate } from "react-router-dom";

// Index just routes to the dashboard. Auth is enforced by the parent route in App.tsx.
const Index = () => <Navigate to="/" replace />;

export default Index;
