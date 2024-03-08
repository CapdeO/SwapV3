
function Alert({ _errorText, _function }) {

    return (
        <div className='p-10 bg-gray-950 rounded-xl inset-x-1/4 inset-y-1/4 fixed flex items-center justify- flex-col justify-center z-50'>
            <span className='text-white font-bold text-2xl text-center'>
                {_errorText}
            </span>
            <button className="text-neutral-700 font-bold w-1/2 bg-amber-300 py-4 rounded-xl mt-7 text-2xl"
                onClick={_function}
            >
                Close
            </button>
        </div>
    )
}

export default Alert