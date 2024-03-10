import { useState } from 'react'
import Swap2 from './components/Swap2'
import { http, createConfig, WagmiProvider } from 'wagmi'
import { polygon } from 'viem/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import "./App.css";
import BackGround from './assets/bg.png'

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
        <div className='bg-gray-900'>
          <div className='h-screen flex flex-col justify-center items-center bg-custom'>

            <div className='w-full flex absolute top-0 p-16'>
              <div className='bg-gray-700 p-3 rounded-xl'>
                <img src="https://kryzum.com/wp-content/uploads/2020/06/Logo200X40.png" className='h-9' />
              </div>
            </div>

            <Swap2 />
          </div>
        </div>

      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
