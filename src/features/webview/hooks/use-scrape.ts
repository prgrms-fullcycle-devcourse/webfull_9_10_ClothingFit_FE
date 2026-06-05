import { handleScrapeWebViewMessage, startScrape } from '../store/scrape-request-store';

/** @deprecated hook wrapper — prefer startScrape / handleScrapeWebViewMessage directly */
export function useScrape() {
  return {
    startScrape,
    handleWebViewMessage: handleScrapeWebViewMessage,
  };
}

export { handleScrapeWebViewMessage, startScrape };
