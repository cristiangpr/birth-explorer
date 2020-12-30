import React, { Component, Fragment, useState, useEffect }from 'react';
import {  Col, Row, Container, Form, Button } from 'react-bootstrap';
import Web3 from 'web3'; 
const INFURA_NODE = "https://mainnet.infura.io/v3/07657336717b4dec8fe343ae2a3837fd";
const ETHERSCAN_API_KEY = "M2WCQ7ADHPHXV4A13J5PNB8G238JXJZ8TT";
const web3 = new Web3(INFURA_NODE);

const { abi } = require('../build/contracts/KittyCore.json');
const CONTRACT_ADDRESS = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";
const etherescan_url = `http://api.etherscan.io/api?module=contract&action=getabi&address=${CONTRACT_ADDRESS}&apikey=${ETHERSCAN_API_KEY}`
const contract =  new web3.eth.Contract(abi, CONTRACT_ADDRESS);



const  Home = () => {
 const [startBlock, setStartBlock] = useState("");
 const [endBlock, setEndBlock] = useState("");
 const [birthCount, setBirthCount] = useState();
 const [topMatrons, setTopMatrons] = useState([]);
 const [errorMessage, setErrorMessage] = useState();
 const [loading, setLoading] = useState(false);

 



const  getBirths = async () =>{





 

          let _fromBlock = startBlock;
          let _toBlock = endBlock;
          let subSet = 5000;
          console.log(_fromBlock)
          let allEvents = [];
          let allMatrons = [];
          let blockRange =  _toBlock - _fromBlock;
          console.log(blockRange)
         
         

    if (blockRange > subSet) {
        try {
          let subSetCount = Math.floor(blockRange / subSet);
          console.log(subSetCount);
          let remainder = blockRange - (subSetCount * subSet);
          console.log(remainder)
          let limitBlock = +_fromBlock + +subSet;
          console.log(limitBlock)
      
      
        for (let i = subSetCount; i > 0; i--) {
                 
             await contract.getPastEvents("Birth",
            {
                                            
        fromBlock: _fromBlock,     
        toBlock: limitBlock // You can also specify 'latest'
            })
            .then((events) => {
             
              
             allEvents.push(events.concat());
            
            
              _fromBlock = +limitBlock + +1;
              limitBlock =  +_fromBlock + +subSet;
              
              })
          }
          if (remainder > 0) {
                    await contract.getPastEvents("Birth",
            {
                                            
        fromBlock: _fromBlock,     
        toBlock: +_fromBlock + +remainder // You can also specify 'latest'
            })
            .then((events) => {
              console.log(events)
             allEvents.push(events.concat());
            
            
         
              
              })
            }
       

         
        }
        catch (error) {
          console.log(error);
       
        }
    } else {
      try {
        await contract.getPastEvents("Birth",
        {
                                        
    fromBlock: _fromBlock,     
    toBlock: endBlock
        })
        .then((events) => {
          console.log(events)
         allEvents.push(events.concat());
        
        
     
          
          })
        

      }
      catch (error) {
        console.log(error);

      }
    }
   
    let flatevents = allEvents.flat(Infinity);
     console.log(flatevents);
     flatevents.forEach(event => allMatrons.push(event.returnValues.matronId));
    
    
    
   
     setBirthCount(flatevents.length);
    
     return allMatrons;
   
    
}  

const findTopMatronIds = (allMatrons) => {
  console.log(allMatrons);
  var counts = {};
  allMatrons.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
  console.log(counts);
  delete counts["0"];
  const vals = Object.values(counts);
  const max = Math.max(...vals);
  console.log(max)
  let topMatronIds =  Object.keys(counts).filter(key => counts[key] === max);
  console.log(topMatronIds);
  return topMatronIds;


}
const getTopMatrons = async (topMatronIds) => {
  let _topMatrons = [];
  await topMatronIds.forEach(async element =>
    await contract.methods.getKitty(element).call().then(result => _topMatrons.push(result))
    
  )
  setTopMatrons(_topMatrons);
 return console.log(topMatrons)

}
const onSubmit = async event => {
  event.preventDefault();
  setLoading(true);
  var a = await getBirths();
  var b = await findTopMatronIds(a);
  await getTopMatrons(b);

  setTimeout(() => {
    setLoading(false);
  }, 3000);

}

const renderMatrons = () => {

  
 return loading ? <p>Loading</p> : <p>{topMatrons.length}</p>
}




  return (
    <Fragment>
    <Form onSubmit={onSubmit} error={errorMessage}>
    <Form.Group >
      <Form.Label>Start Block</Form.Label>
      <Form.Control type="number" placeholder="Enter starting block" 
            value={startBlock}
            onChange={event => setStartBlock(event.target.value)}/>
      
    </Form.Group>
  
    <Form.Group>
      <Form.Label>End Block</Form.Label>
      <Form.Control type="number" placeholder="Enter ending block" 
       value={endBlock}
       onChange={event => setEndBlock(event.target.value)}/>
    </Form.Group>
  
    <Button variant="primary" type="submit">
      Submit
    </Button>
  </Form>
 
  {loading ? <p>Loading</p> : <p>{birthCount}</p>}
  {renderMatrons()}
  </Fragment>
  )
}

export default Home