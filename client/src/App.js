import React, {useState, useEffect} from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import {createBrowserHistory} from 'history'
import Header from "./components/Header";
import Home from './components/Home';
import Artworks from './components/Artworks';
import Artists from './components/Artists';
import ProfilePage from './components/Artist/ProfilePage';
import Art from './components/Artist/Art';
import Create from './components/Artist/Create';

import "./App.css";
import Footer from "./components/Footer";

import Web3Modal from 'web3modal'
import web3 from "./ethereum/web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { WalletLink } from "walletlink";

import coinbaseLogo from './img/coinbase-wallet-logo.svg';

let provider;
const infuraId = "55af5fb4b6fd4172a1eecfa69550e259"

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: infuraId // required
    }
  },
  'custom-walletlink': {
    package: WalletLink,
    display: {
      logo: coinbaseLogo,
      name: "Coinbase Wallet",
      description: 'Scan with WalletLink to connect',
    },
    options: {
      appName: 'Prnts',
      networkUrl: `https://mainnet.infura.io/v3/${infuraId}`,
      chainId: 1
    },
    connector: async (_, options) => {
      const { appName, networkUrl, chainId } = options
      const walletLink = new WalletLink({
        appName
      });
      const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
      await provider.enable();
      return provider;
    },
  },   
};

const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});




const App = () => {
  const [account, setaccount] = useState("");

  useEffect(() => {
    // if(web3.currentProvider){
    onConnectWallet();
    // }
  }, [])

  const onConnectWallet = async () => {
    console.log('connecting wallet...');
    console.log("cached provider", web3Modal.cachedProvider)
    try{
      provider = await web3Modal.connect();
    } catch (err) {
      console.log("Could not get a wallet connection", err);
      return;
    }
    web3.setProvider(provider);
    // setweb(web3);
    const accounts = await web3.eth.getAccounts();
    setaccount(accounts[0])
    // console.log("accounts[0]", accounts[0]);
    // console.log("after setProvider", web3);
    // console.log("cached provider on connect: ", web3Modal.cachedProvider)
    // console.log("web3 on mount", web3);
    // console.log("provider",web3.currentProvider);
    // window.location.reload();
  }
  
  const onDisconnect = async (e) => {
    e.preventDefault();
    // let provider = web3.currentProvider;
    // if(typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    //   if(!(account === "" || typeof account === "undefined")) {
    //     // setaccount("");
    //     const permissions = await window.ethereum.request({
    //       method: "wallet_requestPermissions",
    //       params: [
    //         {
    //           eth_accounts: {}
    //         }
    //       ]
    //     });
    //     console.log("wallet_requestPermissions", permissions)
    //   }
    // }
    
    console.log("cached provider befire provider.close(): ", web3Modal.cachedProvider)
    console.log("Killing the session", web3.currentProvider)
    console.log("web3.givenProvider", web3.givenProvider);
   
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close()
    }

    console.log("cached provider after provider.close(): ", web3Modal.cachedProvider)
    await web3Modal.clearCachedProvider();
    console.log("cached provider after clear: ", web3Modal.cachedProvider)
    provider = null;
    // setaccount("");
    window.location.reload();
  }

  return (
    <BrowserRouter history={createBrowserHistory} >
      <div>
        <Header account={account} />
        <div 
          style={{
            // marginLeft: "0px",
            // top: "15px",
            position: "absolute",
            zIndex: "1",
            padding: "15px 15px",
            // marginLeft: "0px"
            right: "10px",
            top: "50px",
            // left: "100px"
          }}
        >
        {
          account === "" || typeof account === "undefined"
          ?
          <button className="btn" onClick={() => onConnectWallet()}>Connect Wallet</button>
          :
          (
            <h4 
              style={{
                  textDecoration: "underline",
                  cursor: "pointer",
              }}
              onClick={onDisconnect}
            >
              Disconnect
            </h4>
          )
        }  
        </div>  
        <div 
          style={{
            margin: "60px 10px"
          }}
        />
        {/* <button className="btn" onClick={() => console.log(account)}>Account</button> */}
        <Switch>
          <Route path = '/' exact component = {() => <Home />} />
          <Route path = '/music' exact component = {() => <Artworks />} />
          <Route path = '/artists' exact component = {() => <Artists />} />
          <Route path = '/music/:id' exact component = {() => <Art account={account} />} />
          <Route path = '/artists/:id' exact component = {() => <ProfilePage />} />
          <Route path = '/create' exact component = {() => <Create account={account} />} />
        </Switch>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App;
