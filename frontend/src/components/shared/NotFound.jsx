import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-3 px-4 text-center">
    <p className="text-sm font-semibold text-[#6a38c2]">404</p>
    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Page not found</h1>
    <p className="text-sm text-gray-500 max-w-sm">
      The page you are looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/"
      className="mt-2 px-5 py-2.5 rounded-xl bg-[#6a38c2] hover:bg-[#5b2db0] text-white text-sm font-semibold transition-colors"
    >
      Go home
    </Link>
  </div>
);

export default NotFound;
