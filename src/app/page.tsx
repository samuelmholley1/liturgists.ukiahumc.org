import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="mb-6">
            <Image
              src="/logo-for-church-larger.jpg"
              alt="Ukiah United Methodist Church Logo"
              width={200}
              height={200}
              className="mx-auto rounded-full shadow-lg"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Ukiah United Methodist Church
          </h1>
          <h2 className="text-2xl text-blue-600 mb-4">Liturgist Signup</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Thank you for your willingness to serve as a liturgist in our worship services. 
            Sign up for available dates below or view the current schedule.
          </p>
        </header>

        {/* Main Content Area */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Sign Up Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Sign Up for a Date
            </h3>
            <p className="text-gray-600 mb-6">
              View available dates and sign up to serve as a liturgist for Sunday worship.
            </p>
            <Link 
              href="/signup"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Available Dates
            </Link>
          </div>

          {/* Schedule Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Current Schedule
            </h3>
            <p className="text-gray-600 mb-6">
              View the current liturgist schedule and see who is scheduled for upcoming services.
            </p>
            <Link 
              href="/schedule"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              View Schedule
            </Link>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">What Does a Liturgist Do?</h3>
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-600 mb-4">
              As a liturgist, you'll help lead our congregation in worship by:
            </p>
            <ul className="text-gray-600 space-y-2 mb-6">
              <li>• Reading the Call to Worship</li>
              <li>• Leading the Responsive Reading</li>
              <li>• Reading the Scripture lesson(s)</li>
              <li>• Assisting with other liturgical elements as needed</li>
            </ul>
            <p className="text-gray-600">
              The bulletin and readings will be provided to you in advance. 
              If you have any questions, please contact the church office.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-600 mt-12">
          <p className="mb-2">
            <strong>Ukiah United Methodist Church</strong>
          </p>
          <p className="mb-2">
            270 N. Pine St., Ukiah, CA 95482 | 707.462.3360
          </p>
          <p className="text-sm">
            <a 
              href="https://ukiahumc.org" 
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              ukiahumc.org
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}