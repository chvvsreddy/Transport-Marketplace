import { Request,Response } from "express";
import { PrismaClient } from "@prisma/client";



const prisma =  new PrismaClient();

export const getAllLoads = async (req:Request,res:Response):Promise<void> =>{
   try{
    const allLoads = await prisma.loads.findMany({
        take: 15,
        orderBy:{
            createdAt: "desc"
        }
    })
    res.json(allLoads)

   }catch(error){
        res.status(500).json({message:"Error in receiving All Loads"})
   }
}