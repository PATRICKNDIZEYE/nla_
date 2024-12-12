export const detectLanguage = (userAgent: string, acceptLanguage: string): string => {
  // Default to Kinyarwanda
  let defaultLang = 'rw';
  
  // Check accept-language header
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',');
    const primaryLang = languages[0].split(';')[0].toLowerCase();
    
    if (primaryLang.startsWith('en')) return 'en';
    if (primaryLang.startsWith('fr')) return 'fr';
    if (primaryLang.startsWith('rw')) return 'rw';
  }
  
  return defaultLang;
}; 