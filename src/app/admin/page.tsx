'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { liturgists, getRegularLiturgists, getOccasionalLiturgists } from '@/admin/liturgists'

export default function AdminPage() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const regularLiturgists = getRegularLiturgists()
  const occasionalLiturgists = getOccasionalLiturgists()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEmail(text)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const copyAllEmails = () => {
    const allEmails = liturgists.map(l => l.email).join(', ')
    navigator.clipboard.writeText(allEmails)
    setCopiedEmail('all')
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="mb-4">
            <Image
              src="/logo-for-church-larger.jpg"
              alt="Ukiah United Methodist Church Logo"
              width={120}
              height={120}
              className="mx-auto rounded-full shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Liturgist Directory
          </h1>
          <p className="text-gray-600 mb-4">Contact information for all liturgists</p>
          <Link 
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </header>

        {/* Copy All Emails Button */}
        <div className="mb-6 text-center">
          <button
            onClick={copyAllEmails}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {copiedEmail === 'all' ? '✓ Copied All Emails!' : 'Copy All Email Addresses'}
          </button>
        </div>

        {/* Regular Liturgists */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Regular Liturgists ({regularLiturgists.length})
          </h2>
          <div className="space-y-3">
            {regularLiturgists.map((liturgist) => (
              <div 
                key={liturgist.email}
                className="p-4 border border-green-200 bg-green-50 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{liturgist.name}</h3>
                  <a 
                    href={`mailto:${liturgist.email}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {liturgist.email}
                  </a>
                </div>
                <button
                  onClick={() => copyToClipboard(liturgist.email)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm"
                >
                  {copiedEmail === liturgist.email ? '✓ Copied' : 'Copy Email'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Occasional Liturgists */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Occasional Liturgists ({occasionalLiturgists.length})
          </h2>
          <div className="space-y-3">
            {occasionalLiturgists.map((liturgist) => (
              <div 
                key={liturgist.email}
                className="p-4 border border-blue-200 bg-blue-50 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{liturgist.name}</h3>
                  <a 
                    href={`mailto:${liturgist.email}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {liturgist.email}
                  </a>
                </div>
                <button
                  onClick={() => copyToClipboard(liturgist.email)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  {copiedEmail === liturgist.email ? '✓ Copied' : 'Copy Email'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-800">{liturgists.length}</p>
              <p className="text-sm text-gray-600">Total Liturgists</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{regularLiturgists.length}</p>
              <p className="text-sm text-gray-600">Regular</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">{occasionalLiturgists.length}</p>
              <p className="text-sm text-gray-600">Occasional</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-600 mt-8 text-sm">
          <p className="mb-1">
            <strong>Ukiah United Methodist Church</strong>
          </p>
          <p className="mb-1">
            270 N. Pine St., Ukiah, CA 95482 | 707.462.3360
          </p>
          <p className="text-xs">
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
