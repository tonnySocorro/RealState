import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import detectEthereumProvider from "@metamask/detect-provider";
import {Contract, ethers} from "ethers";
import { useState, useEffect, useRef } from 'react';
import realStateContractManifest from "./contracts/RealStateContract.json";

import realStateContractCitiesManifest from "./contracts/RealStateContractCities.json";

function App(){
const [authorizedAddresses, setAuthorizedAddresses] = useState([]);
const [newAuthorizedAddress, setNewAuthorizedAddress] = useState('');


    
  const realStateCities = useRef(null); 
  const realState = useRef(null);
  const [realStateArray, setRealStateArray] = useState([])
    useEffect( () => {
        initContracts();
    }, [])

    let initContracts = async () => {
        await getBlockchain();
    }
    let onSubmitAddAuthorizedAddress = async (e) => {
      try {
        e.preventDefault();
        const tx = await realStateCities.current.addAuthorizedAddress(newAuthorizedAddress);
        await tx.wait();
        // Actualizar la lista de direcciones autorizadas
        updateAuthorizedAddresses();
      } catch (error) {
        console.error("Error adding authorized address:", error);
        alert("Error adding authorized address");
      }
      };
    
      let onSubmitRemoveAuthorizedAddress = async (addressToRemove) => {
        try {
        const tx = await realStateCities.current.removeAuthorizedAddress(addressToRemove);
        await tx.wait();
        // Actualizar la lista de direcciones autorizadas
        updateAuthorizedAddresses();
      } catch (error) {
        console.error("Error removing authorized address:", error);
        alert("Error removing authorized address")
      }
      };
      let updateAuthorizedAddresses = async () => {
        try {
        // Obtener la lista actualizada de direcciones autorizadas y actualizar el estado
        const addresses = await realStateCities.current.getAuthorizedAddresses();
        setAuthorizedAddresses(addresses);
      } catch (error) {
        console.error("Error updating authorized addresses:", error);
        alert("Error updating authorized addresses")
      }
        
      };

    let getBlockchain = async () => {
        
        let provider = await detectEthereumProvider();
        if(provider) {
            await provider.request({ method: 'eth_requestAccounts' });
            const networkId = await provider.request({ method: 'net_version' })

            provider = new ethers.providers.Web3Provider(provider);
            const signer = provider.getSigner();
            realState.current = new Contract(
              realStateContractManifest.networks[networkId].address,
              realStateContractManifest.abi,
              signer
          );
          realStateCities.current = new Contract(
            realStateContractCitiesManifest.networks[networkId].address,
            realStateContractCitiesManifest.abi,
            signer
        );


        console.log("RealState contract address:", realState.current.address);
        console.log("RealStateCities contract city address:", realStateCities.current.address);
    
        }
        return null;
    }
    let onSubmitAddRealState = async (e) => {
      try {
      e.preventDefault();
         // this function use gas
    const tx = await realStateCities.current.addRealState({
      city : e.target.elements[0].value,
      street : e.target.elements[1].value,
      number : parseInt(e.target.elements[2].value),
      meters : parseInt(e.target.elements[3].value),
      registration : parseInt(e.target.elements[4].value),
      owner : e.target.elements[5].value,
      price: parseInt(e.target.elements[6].value),
  });
  

      await tx.wait();
    } catch (error) {
      console.error("Error adding RealState:", error);
      alert("Error adding RealState")
    }

  }
  
  let onSubmitSearchRealState = async (e) => {
    try {
    e.preventDefault();

    let city = e.target.elements[0].value;

    let newProperties = await realStateCities.current.getRealStateByCity(city);
    
    setRealStateArray(newProperties)
  } catch (error) {
    console.error("Error searching RealState:", error);
    alert("Error searching RealState")
  }
}

let clickOnDeleteRealState = async (registration) => {
  try {
  const tx =  await realStateCities.current.deleteRealStateByRegistration(registration);
  await tx.wait();
  setRealStateArray([])
} catch (error) {
  console.error("Error deleting RealState:", error);
  alert("Error deleting RealState")
}
}


  

    return (
        <div>
            <h1>RealState</h1>
            <h2>Authorized Addresses</h2>
      <ul>
        {authorizedAddresses.map((address) => (
          <li key={address}>
            {address}
            <button onClick={() => onSubmitRemoveAuthorizedAddress(address)}>Remove</button>
          </li>
        ))}
      </ul>
      <form onSubmit={(e) => onSubmitAddAuthorizedAddress(e)}>
        <input type="text" placeholder="New Authorized Address" onChange={(e) => setNewAuthorizedAddress(e.target.value)} />
        <button type="submit">Add Authorized Address</button>
      </form>
            <h2>Add RealState</h2>
        <form onSubmit= { (e) => onSubmitAddRealState(e) } >
            <input type="text" placeholder="city"/>
            <input type="text" placeholder="street"/>
            <input type="number" placeholder="number"/>
            <input type="number" placeholder="meters"/>
            <input type="number" placeholder="registration"/>
            <input type="text" placeholder="owner name"/>
            <input type="number" placeholder="price"/>
            <button type="submit">Add</button>
        </form>
        <h2>Search RealState</h2>
         <form onSubmit= { (e) => onSubmitSearchRealState(e) } >
         <input type="text" placeholder="city"/>
         <button type="submit">Search</button>
        </form>

        { realStateArray.map( (r) =>
            (<p> 
                    <button onClick={ () => { clickOnDeleteRealState(r.registration) } }>Delete</button>
        
                {r.city} - 
                {r.street} - 
                {ethers.BigNumber.from(r.number).toNumber()} -
                {ethers.BigNumber.from(r.meters).toNumber()} -
                {ethers.BigNumber.from(r.registration).toNumber()} -

                {r.owner}-
                {ethers.BigNumber.from(r.price).toNumber() > 0 ? ethers.BigNumber.from(r.price).toNumber(): "Price 0"}$
            </p>)
        ) }
   
 


        </div>
    )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);
