export default function Header() {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold">UUMC Liturgist Signup</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="hover:text-blue-200 transition-colors">
              Home
            </a>
            <a href="/signup" className="hover:text-blue-200 transition-colors">
              Sign Up
            </a>
            <a href="/schedule" className="hover:text-blue-200 transition-colors">
              Schedule
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}