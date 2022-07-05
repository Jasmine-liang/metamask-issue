export * from "./fetch";
export * from "./wallet";
export * from "./airdrop";
export * from "./fairdrop";

/**
 * MetaMask
 */
export const canAddToMetaMask = () =>
  "ethereum" in window && window?.ethereum?.request;

export const addTokenToMetaMask = async () => {
  await window?.ethereum?.request({
    // @ts-ignore
    method: "wallet_watchAsset",
    params: {
      // @ts-ignore
      type: "ERC20",
      options: {
        address: process.env.NEXT_PUBLIC_CONTRACT_TOKEN,
        symbol: "SPACE",
        decimals: 18,
        image: "https://thespace.game/img/avatar.png",
      },
    },
  });
};

/**
 * Twitter
 */
const REGEXP_TWEET =
  /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/;

export const getTweetID = (url: string) => {
  const matches = url.match(REGEXP_TWEET);
  return matches && matches[3];
};

export const isTweetURL = (url: string) => {
  return REGEXP_TWEET.test(url);
};
