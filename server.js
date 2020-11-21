const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const fs = require("fs");
const welcomeMessage = require("./data.json");
/* const { request } = require("http");
const { response } = require("express"); */


//status method
const checkStatus = (obj) => { 
  let objCheckFrom = false;
  let objCheckText = false;

  obj.from && obj.from != '' ? objCheckFrom = true : objCheckFrom = false;
  obj.text && obj.text != '' ? objCheckText = true : objCheckText = false;

  if (objCheckFrom && objCheckText) {
    return true;    
  } else {
    return false;
  }
}

const updateDataBase = (newMessage) => {
  //para evitar mutabilidad
  let newMessageData = welcomeMessage;
  newMessageData.push(newMessage);
  //sobrescribir el data.json
  fs.writeFileSync("./data.json", JSON.stringify(newMessageData));  
  return({success: true});
}

const findText = (text) => {
  return welcomeMessage.filter(el => el.text.includes(text));
}

const findLatest = () => {
  let findLastMessages =  [];

  if (welcomeMessage.length <= 10) {
    return welcomeMessage;
  } else {
    for (let index = 0; index <= 9; index++) {
      findLastMessages.push(welcomeMessage[welcomeMessage.length -1 - index]);     
    } 
    return findLastMessages; 
  };
}
//This array is our "data store".
//We will start with one message in the array.
//Note: messages will be lost when Glitch restarts our server.
/* const messages = [welcomeMessage]; */

app.get("/", (request, response)  => {
  response.sendFile(__dirname + "/index.html");
});

//ENDPOINTS
app.get("/messages", (request, response) => {
  response.json(welcomeMessage);
});

app.get("/messages/:id", (request, response) => {
  const id = request.params.id;
  const message = welcomeMessage.filter((el) => el.id === id);
  response.json(message);
});

app.get("/message/search", (request, response) => {
 /*  console.log('haz algo', request.query); */
  let text = request.query.text;
  /* console.log('text',text); */
  response.json(findText(text));
});

app.get("/message/latest", (request, response) => {
  response.json(findLatest());
});
//POST 
app.post("/messages", (request, response) =>  {
  const newMessage = request.body;
  /* console.log(newMessage); */
  let maxId = Math.max(...welcomeMessage.map((el) => el.id));
  /* console.log(maxId); */
  newMessage.id = maxId + 1;

  const dateStamp = new Date();
  newMessage.dateStamp = dateStamp;

  let check = checkStatus(newMessage);
  check ? response.status(200).json(updateDataBase(newMessage)) : response.status(400).json({success: false});
  }
);

//DELETE
app.delete("/messages/:id", (request, response) => {
  const id = request.params.id;
  const message = welcomeMessage.filter((el) => el.id === id);
  const index = welcomeMessage.indexOf(message[0]);
  let newMessageData = welcomeMessage;
  newMessageData.splice(index, 1);
  fs.writeFileSync("./data.json", JSON.stringify(newMessageData));
  response.status(200).json({success: true});
})

app.listen(3005, () => {
  console.log("App is listening at port 3005");
});
