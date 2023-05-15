import 'focus-visible'
import '@/styles/tailwind.css'
import { useState } from 'react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { LicenseInfo } from '@mui/x-data-grid-pro'

LicenseInfo.setLicenseKey(process.env.NEXT_PUBLIC_MUI_PREMIUM_LICENSE)

export default function App({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  )
}


// export default function App({ Component, pageProps }) {
//   return <Component {...pageProps} />
// }
