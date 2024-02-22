import { useState } from 'react'
import Swap from './components/Swap'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='bg-orange-400 h-screen flex justify-center items-center'>
      <Swap />


    </div>
  )
}

export default App
