import React, { Component, Fragment, useState }from 'react';
import {  Col, Row, Container, Form, Button } from 'react-bootstrap';
import Web3 from 'web3'; 
const INFURA_NODE = "https://mainnet.infura.io/v3/07657336717b4dec8fe343ae2a3837fd";
const ETHERSCAN_API_KEY = "M2WCQ7ADHPHXV4A13J5PNB8G238JXJZ8TT";
const web3 = new Web3(INFURA_NODE);
const { abi } = require('../build/contracts/KittyBase.json');
const CONTRACT_ADDRESS = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";
const etherescan_url = `http://api.etherscan.io/api?module=contract&action=getabi&address=${CONTRACT_ADDRESS}&apikey=${ETHERSCAN_API_KEY}`
const contract =  new web3.eth.Contract(abi, CONTRACT_ADDRESS);


const  Home = () => {
 const [startBlock, setStartBlock] = useState(0);
 const [endBlock, setEndBlock] = useState(0);
 const [birthCount, setBirthCount] = useState();
 const [topMatron, setTopMatron] = useState();
 const [errorMessage, setErrorMessage] = useState();
 const [loading, setLoading] = useState(false);

 



const  getPastEvents = async () =>{


 setLoading(true); 


 

 let _fromBlock = startBlock;
          let _toBlock = endBlock;


    if (_fromBlock <= _toBlock) {
        try {
         console.log(_fromBlock)
          let allEvents = [];
          let blockRange =  _toBlock - _fromBlock;
          console.log(blockRange)
          let subSetCount = Math.ceil(blockRange / 20000);
          console.log(subSetCount);
          let limitBlock = +_fromBlock + +20000;
          console.log(limitBlock)
      
      
        for (let i = subSetCount; i > 0; i--) {
                 
             await contract.getPastEvents("Birth",
            {
                                            
        fromBlock: _fromBlock,     
        toBlock: limitBlock // You can also specify 'latest'
            })
            .then((events) => {
              console.log(events)
             allEvents.push(events.concat());
            
            
              _fromBlock = +limitBlock + +1;
              limitBlock = _toBlock
              
              })
          }
          setLoading(false);
         let flatevents = allEvents.flat(Infinity);
          console.log(flatevents);
          return setBirthCount(flatevents.length)
         
        }
        catch (error) {
          console.log(error);
       
        }
    }
    
}  
const onSubmit = async event => {
  event.preventDefault();
  getPastEvents();
  console.log(birthCount)
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
  </Fragment>
  )
}

export default Home