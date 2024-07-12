"use client"
import GetUser from '@/helpers/GetUser'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
function Page() {
  const [user,setUser]  = useState<object>()
  const LoadUser = async()=>{
    await GetUser().then((user)=>{
      setUser(user)
    })
  }
  const [initLoading,setInitLoading] = useState<Boolean>(false);

    const initialize = async (userId) => {
      setInitLoading(true)
      try {
        await axios.post(!process.env.SERVER_DOMAIN+'/init',{userId:userId}).then(res=>{
          console.log(res)
        })
      } catch (error) {
        
      }
      setInitLoading(false)
    }

    useEffect(()=>{
      if(user != null){
        initialize(user._id)
      }
    },[user])

    useEffect(()=>{
      LoadUser()
    },[])


  const [command , setCommand ] =useState("")

  const PostData = async()=>{
    if(command == ""){
      return
    }
    try {
      console.log(true)
    await axios.post(!process.env.SERVER_DOMAIN+"/execute",{command:command,userId:user._id}).then((res)=>{
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
