import express from "express";

import mongoose from "mongoose";
import Messages from "./dbMessages.js";
// import dbMessages from "./dbMessages.js";
import Cors from "cors";
import Pusher from "pusher";
const app = express();
app.use(express.json())
app.use(Cors())
const port = process.env.PORT || 5000



const connection_url="mongodb+srv://ashishkalyan007:ashish@cluster0.un8pnlw.mongodb.net/?retryWrites=true&w=majority"



mongoose.connect(connection_url)
  .then(() => console.log("DB Connected!"))
  .catch(err => {
    console.error(err.message);
  });

  const pusher = new Pusher({
    appId: "1679702",
    key: "cb26ab704a7cb21eba84",
    secret: "cec9befeff2746780cb5",
    cluster: "ap2",
    useTLS: true
  });


  const db = mongoose.connection
db.once("open", () => {
console.log("DB Connected")
const msgCollection = db.collection("messagingmessages")
const changeStream = msgCollection.watch()
changeStream.on('change', change => {
console.log(change)
if(change.operationType === "insert") {
const messageDetails = change.fullDocument
pusher.trigger("messages", "inserted", {
name: messageDetails.name,
message: messageDetails.message,
timestamp: messageDetails.timestamp,
received: messageDetails.received
})

} else {
    console.log('Error trigerring Pusher')
    }
    })
    })


















  app.post("/messages/new", async (req, res) => {
    try {
        const dbMessage = req.body;
        console.log(dbMessage);

        const createdMessages = await Messages.insertMany([dbMessage]);
        res.status(201).send(createdMessages[0]);
    } catch (error) {
        console.error("kuch dikat h", error);
        res.status(500).send(error);
    }
});






app.get('/messages/sync', async (req, res) => {
    try {
        const data = await Messages.find();
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});





















    app.get("/", (req, res) => {

        res.status(200).send("Hello World");
    });

app.listen(port, () => console.log(`Listening on localhost:${port}`));

