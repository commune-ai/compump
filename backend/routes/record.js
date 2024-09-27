import express from "express";
import { Server } from "socket.io";
import { createServer } from 'http';
import cors from "cors";
import { emitLiveTx } from "../server.js";

// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";



// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();
// router.post("/", async (req, res) => {
//     try {
//         let newDocument = {
//         name: req.body.name,
//         position: req.body.position,
//         level: req.body.level,
//         };
//         let collection = await db.collection("records");
//         let result = await collection.insertOne(newDocument);
//         res.send(result).status(204);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Error adding record");
//     }
// });

router.post("/module/visit", async (req, res) => {
  try {
    const date = new Date();
    const epochTimeInSeconds = Math.floor(date.getTime()/1000);
    let {address, moduleAddress, stakeAmount, visitEpochTime} = req.body;
    const collection = db.collection("module_visits")

    const moduleVisit= await collection.findOne({ address: address, moduleAddress: moduleAddress });
    const filter = {address, moduleAddress};

    if(moduleVisit) {
      if(epochTimeInSeconds-moduleVisit.lastVisitAt <= 20){
        console.log("Skipping too frequently request");
      }else{
        if(moduleVisit.freeVisitRemained> 0){ //see if free visit remained
          const freeVisitRemained = moduleVisit.freeVisitRemained-1;
          const updateData ={
            $set:{
              lastVisitAt: epochTimeInSeconds, freeVisitRemained
            }
          }
          await collection.updateOne(filter, updateData);
          res.send({status:true, message: 'Visit allowed'}).status(200);
        }else{
          if(stakeAmount/100 >1){ //see if he staked enough to use this module
            if(epochTimeInSeconds-moduleVisit.lastVisitAt>=24*60*60){// if passed one day from the last visit
              console.log("moduleVisit", moduleVisit);
              const updateData ={
                $set:{
                  lastVisitAt: epochTimeInSeconds, visitCountToday: 1
                }
              }
              await collection.updateOne(filter, updateData);
              res.send({status: true, message:'Visit allowed'}).status(200)
            }
            else{
              if(Math.floor(stakeAmount/100)<= moduleVisit.visitCountToday){
                res.send({status: false, message:'Staked insufficient', stakeAmount}).status(204)
              }else{
                const updateData ={
                  $set:{
                    visitCountToday: moduleVisit.visitCountToday+1
                  }
                }
                await collection.updateOne(filter, updateData);
                res.send({status: true, message:'Visit allowed'}).status(200)
              }
            }
          }else{
            res.send({status: false, message: 'Staked insufficient', stakeAmount}).status(204);
          }
        }
        
      }
    }else{
      const newModuleVisit = {address, moduleAddress, firstVisitAt: visitEpochTime, lastVisitAt: visitEpochTime, freeVisitRemained: 9, visitCountToday: 1};
      await collection.insertOne(newModuleVisit);
      res.send({status: true, message: 'Visit allowed'}).status(200);
    }
  } catch (err) {
    console.error("error on server", err);
    res.status(500).send({status: false, message:"Error adding visit"});
  }
})



export default router;

