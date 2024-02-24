import { useState } from 'react'
import Swap2 from './components/Swap2'
import { http, createConfig, WagmiProvider } from 'wagmi'
import { polygon } from 'viem/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import "./App.css";

function App() {
  const config = createConfig({
    chains: [polygon],
    transports: {
      [polygon.id]: http('https://polygon-mainnet.g.alchemy.com/v2/mvq3cNlykou-7IoCzmaCaInvOxLckKzJ'),
    }
  })
  const queryClient = new QueryClient()

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className='bg-orange-400 h-screen flex justify-center items-center'>
          <Swap2 />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
