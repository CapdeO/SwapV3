import { useState } from 'react'
import Swap2 from './components/Swap2'

function App() {
  const [count, setCount] = useState(0)
  

  return (
    <div className='bg-orange-400 h-screen flex justify-center items-center'>
      <Swap2 />


    </div>
  )
}

export default App
