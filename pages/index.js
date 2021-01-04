import React, {  useState }from 'react';
import {  Col, Row, Container, Form, Button, Card, ListGroup, Spinner } from 'react-bootstrap';
import Web3 from 'web3'; 
const INFURA_NODE = process.env.NEXT_PUBLIC_INFURA_NODE;
const web3 = new Web3(INFURA_NODE);
const { abi } = require('../build/contracts/KittyCore.json');
const CONTRACT_ADDRESS = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";
const contract =  new web3.eth.Contract(abi, CONTRACT_ADDRESS);


const  Home = () => {
 const [startBlock, setStartBlock] = useState("");
 const [endBlock, setEndBlock] = useState("");
 const [birthCount, setBirthCount] = useState();
 const [matronBirths, setMatronBirths] = useState();
 const [topMatrons, setTopMatrons] = useState();
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
             console.log(events)
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
       } catch (error) {
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
        
        }catch (error) {
        console.log(error);
       }
    }
   
     let flatEvents = allEvents.flat(Infinity);
     console.log(flatEvents);
     flatEvents.forEach(event => allMatrons.push(event.returnValues.matronId));
     setBirthCount(flatEvents.length);
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
  console.log(max);
  setMatronBirths(max);
  let topMatronIds =  Object.keys(counts).filter(key => counts[key] === max);
  console.log(topMatronIds);
  return topMatronIds;


}
const getTopMatrons = async (topMatronIds) => {
    let _topMatrons = [];
    topMatronIds.forEach(async element =>
    await contract.methods.getKitty(element).call().then(result => _topMatrons.push(result))
    
  )
 return setTopMatrons(_topMatrons);
 

}
const onSubmit = async event => {
  event.preventDefault();
  setLoading(true);
  var births = await getBirths();
  var ids = findTopMatronIds(births);
  await getTopMatrons(ids);

  setTimeout(() => {
    setLoading(false);
  }, 1000);
  return console.log(topMatrons)
}

const renderMatrons = () => {
return topMatrons && topMatrons.map((matron, index) =>
 <Col style={{paddingTop:"10px"}} key={index} >
  <Card border="dark"   >
    <Card.Title>Genes</Card.Title>
     <Card.Header>{matron.genes}</Card.Header>
      <Card.Body>
       <ListGroup variant="flush">
         <Card.Title>Birth Time</Card.Title>
         <Card.Header>{new Date(matron.birthTime * 1000).toGMTString()}</Card.Header>
         <Card.Title>Generation</Card.Title>
         <Card.Header>{matron.generation}</Card.Header>
      </ListGroup>
    </Card.Body>
  </Card>
</Col>

)
}





  return (
    
      <Container fluid>
         <Row  style={{paddingTop: "50px", textAlign: "center"}}>
            <Col>
              <h1>CryptoKitties Birth Explorer</h1>
            </Col>
         </Row>
         <Row  style={{paddingTop: "100px", textAlign: "center"}}>
            <Col>
             <img src='https://www.cryptokitties.co/images/breeding-heart/breeding-kitties.svg' style={{maxWidth:"90%", maxHeight:"65%"}}/>
           </Col>
         </Row>
         <Row  style={{ textAlign: "center"}}>
            <Col md={4}></Col>
            <Col md={4}>
              <Form onSubmit={onSubmit} error={errorMessage}>
                <h6>Enter a starting block and an ending block to find the number of births and top matrons during that time! </h6>
                <Form.Group >
                  <Form.Label>Start Block</Form.Label>
                    <Form.Control  placeholder="Enter starting block" 
                                   value={startBlock}
                                   onChange={event => setStartBlock(event.target.value)}/>
                </Form.Group>
                <Form.Group>
                  <Form.Label>End Block</Form.Label>
                    <Form.Control  placeholder="Enter ending block" 
                                   value={endBlock}
                                   onChange={event => setEndBlock(event.target.value)}/>
                </Form.Group>
                    {loading ?  <Button  disabled type="submit" style={{backgroundColor:"#ef52d1", outlineColor:"#ef52d1 !important" }}>
                                  <Spinner
                                      as="span"
                                      animation="grow"
                                      size="sm"
                                      role="status"
                                     aria-hidden="true"
                            />
                                    Loading...
                                </Button> :
                                <Button  type="submit" style={{backgroundColor:"#ef52d1", outlineColor:"#ef52d1 !important" }}>
                                    Submit
                                </Button> }

              </Form>
            </Col>
            <Col md={4}></Col>
        </Row>
        <Row  style={{paddingTop: "30px", textAlign: "center"}}>
           <Col>
             {loading ? <p>This may take several minutes</p> : <h6>Total Births: {birthCount}      </h6>}
           </Col>
        </Row>
        <Row  style={{paddingTop: "30px", textAlign: "center"}}>
           <Col>
             {loading ? <p></p> : <h6>     Births per top matron: {matronBirths}</h6>}
           </Col>
        </Row>
        <Row  style={{paddingTop: "30px", paddingBottom: '30px', textAlign: "center"}}>
           <Col>
            <h2 style={{textAlign:"center"}}>Top Matrons</h2>
           </Col>
       </Row>
        <Row  style={{paddingTop: "30px", paddingBottom: '30px', textAlign: "center", backgroundColor:"#ef52d1", minWidth:"100%"}}>
          {loading ? <p></p> : renderMatrons()}
        </Row>
     </Container>
  

  )
}

export default Home