import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function CreateDelayedRevealNft(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(process.env.GOERLI_WALLET_PRIVATE_KEY);
  const goerliSDK = ThirdwebSDK.fromPrivateKey(
    process.env.GOERLI_WALLET_PRIVATE_KEY as string,
    "goerli"
  );

  const contract = goerliSDK.getNFTDrop(
    process.env.NFT_DROP_CONTRACT_ADDRESS as string
  );

  contract.interceptor.overrideNextTransaction(() => ({
    gasLimit: 3000000,
  }));

  const TOTAL_NFT_TO_BE_MINTED = 10;
  // the real NFTs, these will be encrypted until you reveal them
  const realNFTs = Array(TOTAL_NFT_TO_BE_MINTED)
    .fill([])
    .map((a) => ({
      name: `It’s Kenny – It Doesn’t Matter`,
      description: "It’s Kenny – It Doesn’t Matter",
      animation_url: fs.readFileSync("./public/mint.mp4"),
      image: fs.readFileSync("./public/cover.png"),
    }));

  // A placeholder NFT that people will get immediately in their wallet, and will be converted to the real NFT at reveal time
  const placeholderNFT = {
    name: "It’s Kenny",
    description: "To be revealed!",
    animation_url: fs.readFileSync("./public/placeholder.mp4"),
    image: fs.readFileSync("./public/placeholder-cover.jpg"),
  };

  await contract.revealer.createDelayedRevealBatch(
    placeholderNFT,
    realNFTs,
    "password"
  );

  res.status(200).json({ success: true });
}
