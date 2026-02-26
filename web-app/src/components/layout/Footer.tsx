import { EnvelopeIcon, QuestionMarkCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-gray-300 py-4 px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Copyright */}
        <div className="text-sm">
          <p>&copy; {currentYear} Amma Rakshitha - Maternal Healthcare Management System</p>
          <p className="text-gray-400">Government of Telangana, District Nirmal</p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <a
            href="#terms"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <DocumentTextIcon className="h-4 w-4" />
            Terms & Conditions
          </a>
          <a
            href="#faq"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <QuestionMarkCircleIcon className="h-4 w-4" />
            FAQs
          </a>
          <a
            href="mailto:helpdesk@ammarakshitha.gov.in"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <EnvelopeIcon className="h-4 w-4" />
            helpdesk@ammarakshitha.gov.in
          </a>
        </div>

        {/* Powered By */}
        <div className="text-sm text-gray-400">
          Powered by{' '}
          <a
            href="https://www.austechglobal.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Austech Services India Pvt Ltd
          </a>
        </div>
      </div>
    </footer>
  )
}
