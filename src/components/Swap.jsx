import React, { useState } from 'react';

const Swap = () => {

    const [tokenPrice, setTokenPrice] = useState('$0.0123')

    return (
        <div className='w-full h-full flex-row'>
            <div className='p-9 h-1/5'>
                <img
                    style={{ width: "220px" }}
                    src={"https://kryzum.com/wp-content/uploads/2020/06/Logo200X40.png"}
                    alt="logo"
                    className="logo"
                />
            </div>

            <div className='flex justify-center items-center h-4/5'>
                <div className='bg-stone-900 w-full max-w-md h-full max-h-96 rounded-2xl border-gray-700 border-2 p-5 flex flex-col justify-between'>
                    <div className='w-full h-1/5 flex items-center'>
                        <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/16639.png" style={{ display: "inline-block", width: "50px" }} />
                        <span className='text-white font-bold ml-2'>
                            {tokenPrice}
                        </span>
                    </div>
                    <div className='w-full p-2'>
                        <span className='text-white font-bold'>
                            Swap
                        </span>
                    </div>

                    <div className='w-full'>

                        <div className="relative rounded-md shadow-sm my-1">
                            <input type="number" name="price" id="price" className="h-20 block w-full rounded-xl border-0 py-1.5 pl-7 pr-20 text-white  placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-3xl sm:leading-6 bg-stone-700 " placeholder="0.00" />
                            <div className="absolute inset-y-0 right-0 flex items-center">
                                <label htmlFor="currency" className="sr-only">Currency</label>
                                <select id="currency" name="currency" className="h-1/2 rounded-2xl border-0 bg-emerald-950 py-0 pl-2 pr-7 text-teal-500">
                                    <option>USDT</option>
                                    <option>XCRE</option>
                                    <option>MATIC</option>
                                </select>
                            </div>
                        </div>
                        <div className="relative rounded-md shadow-sm my-1">
                            <input type="number" name="price" id="price" className="h-20 block w-full rounded-xl border-0 py-1.5 pl-7 pr-20 text-white  placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-3xl sm:leading-6 bg-stone-700 " placeholder="0.00" />
                            <div className="absolute inset-y-0 right-0 flex items-center">
                                <label htmlFor="currency" className="sr-only">Currency</label>
                                <select id="currency" name="currency" className="h-1/2 rounded-2xl border-0 bg-emerald-950 py-0 pl-2 pr-7 text-teal-500">
                                    <option>USDT</option>
                                    <option>XCRE</option>
                                    <option>MATIC</option>
                                </select>
                            </div>
                        </div>


                    </div>


                    <div className='w-full'>
                        <button className='text-teal-500 font-bold w-full bg-emerald-950 py-4 rounded-xl mt-5 text-xl'>
                            Swap
                        </button>
                    </div>


                </div>
            </div>


        </div>
    );
}

export default Swap;