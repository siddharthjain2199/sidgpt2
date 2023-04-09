import React from 'react'
import Spinner from 'react-bootstrap/Spinner';

export const Loading = () => {
  return (<>
    <section className='container mx-auto p-5 fixed inset-0 mt-3'>
      <div className="mockup-window bg-base-300 w-full h-full flex flex-col">
        <div className="p-5 pb-8 flex-grow overflow-auto text-center">
          <Spinner animation="border" variant="info" />
        </div>   </div></section>
  </>

  )
}
