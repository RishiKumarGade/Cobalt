"use client"
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const token = generateRandomToken()
function Page() {

  const [initLoading,setInitLoading] = useState<Boolean>(false);




    const initialize = async () => {
      setInitLoading(true)
      try {
        await axios.post(!process.env.SERVER_DOMAIN+'/init',{token:token}).then(res=>{
          console.log(res)
        })
      } catch (error) {
        
      }
      setInitLoading(false)
    }

    useEffect(()=>{
      initialize()
    },[])


  const [command , setCommand ] =useState("")

  const PostData = async()=>{
    if(command == ""){
      return
    }
    try {
      console.log(true)
    await axios.post(!process.env.SERVER_DOMAIN+"/execute",{command:"dir"}).then((res)=>{
      console.log(res)
    })
    } catch (error) {
      
    }
  }

  return (
    <div>

      <input type="text" onChange={(e)=>{setCommand(e.target.value)}}   name="" id="" />
        <button onClick={(e)=>{e.preventDefault();PostData()}} > execute  </button>
    </div>
  )
}

export default Page


function generateRandomToken() {
  const randomNumber = Math.floor(Math.random() * 900000) + 100000;
  return randomNumber.toString();
}
