export function validateEnv() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_BASE_URL',
    'NEXT_PUBLIC_APP_URL'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  if (process.env.NODE_ENV === 'production') {
    const productionUrl = 'nla.dtecsoftwaresolutions.com';
    if (!process.env.NEXT_PUBLIC_API_URL?.includes(productionUrl)) {
      throw new Error('Production environment detected but using non-production API URL');
    }
  }
} 