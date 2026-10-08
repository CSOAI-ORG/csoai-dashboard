export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-lg font-bold text-gray-900">Council of AI</div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
              Operated by CSOAI Ltd, UK Companies House 16939677. Independent AI measurement,
              signed evidence, free verification and public corrections. Measurement, not certification.
            </p>
          </div>
          <div className="md:text-right">
            <a className="text-sm font-medium text-green-700 hover:underline" href="https://councilof.ai/">
              Current public source of truth
            </a>
            <div className="mt-2 text-sm text-gray-600">
              <a className="hover:underline" href="https://councilof.ai/api/gspc">Live board</a>
              <span aria-hidden="true"> · </span>
              <a className="hover:underline" href="https://councilof.ai/api/corrections">Corrections</a>
              <span aria-hidden="true"> · </span>
              <a className="hover:underline" href="https://councilof.ai/gspc-verify">Verify</a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 text-xs text-gray-500">
          © {currentYear} CSOAI Ltd. Historical certification, compliance, pricing or agent-count copy from this legacy dashboard is superseded by councilof.ai.
        </div>
      </div>
    </footer>
  );
}
