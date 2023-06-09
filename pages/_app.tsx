import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  useAddRecentTransaction,
} from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import Head from "next/head";
import { links } from "../metadata";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import {
  arbitrum,
  goerli,
  mainnet,
  optimism,
  polygon,
  bsc,
  zkSync,
  bscTestnet,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import BNavbar from "../components/Navber";
import Footer from "../components/Footer";
import { Container } from "react-bootstrap";
import { Contract, ethers, Signer } from "ethers";
import Web3 from "web3";
import { Detasker } from "../typechain-types";
import { Address } from "wagmi";
import { useAccount, useConnect, useProvider, useContract } from "wagmi";
import { useEffect } from "react";
import ErrorBoundary from "../components/ErrorBoundary";
import "../styles/globals.css";
const API_KEY = process.env.API_KEY!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
export const contract = require("../libs/Detasker.json");

export let detasker: undefined | Detasker = undefined;
export let signer: undefined | Signer = undefined;

export let web3: Web3 | undefined = undefined;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // we are in the browser and metamask is running
  window.ethereum.request({ method: "eth_requestAccounts" });
  //@ts-ignore
  web3 = new Web3(window.ethereum);
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  signer = provider.getSigner();
} else {
  // we are on the server *OR* the user is not running metamask
  // https://medium.com/jelly-market/how-to-get-infura-api-key-e7d552dd396f
  const provider = new Web3.providers.HttpProvider(
    "https://mainnet.infura.io/v3/xxx_your_key_here_xxx"
  );
  web3 = new Web3(provider);
}
const { chains, provider, webSocketProvider } = configureChains(
  [bscTestnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  const { address, isDisconnected } = useAccount();
  const provider = useProvider();
  console.log(signer);

  useEffect(() => {
    if (!isDisconnected) {
      detasker = new ethers.Contract(
        CONTRACT_ADDRESS,
        contract.abi,
        signer!
      ) as Detasker;
    }
  }, [isDisconnected]);
  return (
    <ErrorBoundary>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <Head>
            <title>Detasker</title>
            <meta
              name="description"
              content="Detasker is a decentralized platform built on the Binance Smart Chain that connects individuals who need a task done with a network of skilled workers, all powered by blockchain technology. Get your tasks done efficiently, securely, and with minimal fees on Detasker."
            />

            <link href="/favicon.ico" rel="icon" />
          </Head>
          <header>
            <BNavbar links={links} />
          </header>
          <Container>
            <Component {...pageProps} />
            <Footer />
          </Container>
        </RainbowKitProvider>
      </WagmiConfig>
    </ErrorBoundary>
  );
}

export default MyApp;
