import React, { Component, Fragment, useState }from 'react';
import {  Col, Row, Container, Form, Button } from 'react-bootstrap';
import Web3 from 'web3'; 
const INFURA_NODE = "https://mainnet.infura.io/v3/b5ab0c2995454d1abe5cbdfe162af992";
const ETHERSCAN_API_KEY = "M2WCQ7ADHPHXV4A13J5PNB8G238JXJZ8TT";
const web3 = new Web3(INFURA_NODE);
const CONTRACT_ADDRESS = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";
const etherescan_url = `http://api.etherscan.io/api?module=contract&action=getabi&address=${CONTRACT_ADDRESS}&apikey=${ETHERSCAN_API_KEY}`



export default function Home() {
 const [startBlock, setStartBlock] = useState(0);
 const [endBlock, setEndBlock] = useState(0);
 const [birthCount, setBirthCount] = useState();
 const [topMatron, setTopMatron] = useState();
 const [errorMessage, setErrorMessage] = useState();
 const [loading, setLoading] = useState(false);




 const getContractAbi = async () =>  {
   let CONTRACT_ABI;
     await fetch(etherescan_url)
    .then((response) => response.json())
      .then((data) =>  CONTRACT_ABI = data.result)
     
      

 
   
    return CONTRACT_ABI;
}

const  getPastEvents = async () =>{
 setLoading(true); 
const CONTRACT_ABI = await getContractAbi();
const contract = new web3.eth.Contract(JSON.parse(CONTRACT_ABI), CONTRACT_ADDRESS);
const _fromBlock = startBlock;
const _toBlock = endBlock;
let count = [];

    if (_fromBlock <= _toBlock) {
        try {
           
            return await contract.getPastEvents("Birth",
            {
                                            
        fromBlock: _fromBlock,     
        toBlock: _toBlock // You can also specify 'latest'
            })
            .then((events) => {
              setLoading(false);
              return  setBirthCount(events.length);
            })
        }
        catch (error) {
          console.log(error);
            const midBlock = (_fromBlock + _toBlock) >> 1;
            const arr1 = await getPastEvents(_fromBlock, midBlock);
            const arr2 = await getPastEvents(midBlock + 1, _toBlock);
            return [...arr1, ...arr2].length;
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
