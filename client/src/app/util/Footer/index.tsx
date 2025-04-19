import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import React from 'react'



const Footer = () => {
  return (
    <div className="footer-main bg-neutral-100 py-12">
        <div className='main-layout'>
        <div className="flex flex-col md:flex-row space-y-4">
            <div className="flex-1/2">
            <Link href="/"><img src="goodseva-logo.png"  alt="Goodseva"  className="h-12 w-auto"/></Link>
            <p className='mb-5'>
               Market place all transport needs.
                </p>
                <button className='button-secondary flex gap-2'><MessageCircle/>  Start Live Chat</button>
            </div>
            <div className="flex-1/4 flex flex-col gap-2" >
                 <p className='text-red-900 font-semibold'>Company </p>
                  <p>About Us
                  </p>
                  <p>
                    Our Partners
                  </p>
                  <p>
                    Support Center
                  </p>
                  <p>
                    Our Network
                  </p>
            </div>
            <div className="flex-1/4 flex flex-col gap-2">
                <p className='text-red-900 font-semibold'> Resources</p>
                  <p>
                    Packing Supplies
                  </p>
                  <p>Faqs</p>
                  <p>
                    Pricing and Quotes
                  </p>
                  <p>
                    Tips and Guides
                  </p>
            </div>
            <div className="flex-1/4 flex flex-col gap-2">
            <p  className='text-red-900 font-semibold'>  Help </p>
                  <p>
                    Customer Support
                  </p>
                  <p>
                    Delivery Details
                  </p>
                  <p>
                    Terms & Conditions
                  </p>
                  <p>
                    Privacy Policy
                  </p>
            </div>
           
        </div>
        <div className="flex-1/1">
                <hr className='my-6'/>
            <p>Copyright &copy; 2024 Goodseva</p>
            </div>
        </div>
      </div>
  )
}

export default Footer