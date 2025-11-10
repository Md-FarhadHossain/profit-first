"use client"
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import getAllOrders from "../../lib/getAllorders"
import { useEffect, useState } from 'react'
import Image from 'next/image' // Make sure Image is imported

const FreeResources = () => {

  const [order, setOrder] = useState(null)
  const [searchMessage, setSearchMessage] = useState("")
  
  // 1. Add a new state to track verification
  const [isVerified, setIsVerified] = useState(false)

  // Fetch all orders when the component loads
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orderData = await getAllOrders()
        console.log("Data fetched:", orderData)
        setOrder(orderData)
      } catch (error) {
        console.error("Failed to fetch orders:", error)
      }
    }
    fetchOrders()
  }, []) 

  const handleSubmit = (event) => {
    event.preventDefault()
    const numberToFind = event.target.number.value

    // 2. Reset status on every new submission
    setSearchMessage("")
    setIsVerified(false) // <-- This is important!

    if (!order) {
      setSearchMessage("Database is still loading, please wait and try again.")
      return
    }

    const foundOrder = order.find(item => item.number === numberToFind)

    if (foundOrder) {
      // 3. If found, set message AND set verified to true
      setSearchMessage("hello")
      setIsVerified(true) 
    } else {
      // 4. If not found, show error and keep verified false
      setSearchMessage("This number was not found in the database.")
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Input name="number" placeholder='Your Phone Number' />
        <Button type="submit">Submit</Button>
      </form>

      {/* This message will show "hello" or "not found" */}
      {searchMessage && (
        <div style={{ marginTop: '1rem' }}>
          <p>{searchMessage}</p>
        </div>
      )}

      {/* 5. This entire section is now conditional */}
      {/* It will ONLY appear if 'isVerified' is true */}
      {isVerified && (
        <div style={{ marginTop: '1rem', border: '1px solid green', padding: '10px' }}>
          <h3>✅ Verification Successful!</h3>
          
          
          
          
        </div>
      )}
    </div>
  )
}

export default FreeResources