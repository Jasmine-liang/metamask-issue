import React, { useEffect, useState } from "react";
import { useAccount, useDisconnect, useNetwork } from "wagmi";
import { useCountdown } from "~/hooks";
import {
  addTokenToMetaMask,
  canAddToMetaMask,
  fetchWrapper,
  toPolygonAddressUrl,
} from "~/utils";

import Empty from "./Empty";
import ClaimDetail from "./ClaimDetail";
import ClaimButton from "./ClaimButton";

import styles from "./styles.module.sass";
import Spinner from "~/components/Spinner";
import ClaimTime from "./ClaimTime";

type ClaimData = {
  proof: string[];
  total: number;
} & { [key: string]: string };

export interface AirdropProps {
  back: () => void;
}

const Airdrop: React.FC<AirdropProps> = ({ back }) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();
  const account = address;
  const isUnsupportedNetwork = chain?.unsupported;

  const [isStarted, setIsStarted] = useState(false);
  const { days, hours, minutes, seconds } = useCountdown({
    end: process.env.NEXT_PUBLIC_CLAIM_START_AT || "",
    onEnd: () => setIsStarted(true),
  });

  const [claimData, setClaimData] = useState<ClaimData>();
  const [loading, setLoading] = useState(false);
  const getAccountClaimData = async (account: string) => {
    setLoading(true);

    try {
      const data = await fetchWrapper.get(
        `/proofs/${account.toLocaleLowerCase()}.json`
      );
      setClaimData(data);
      console.log(data);
    } catch (e) {
      setClaimData({} as any);
      console.error(e);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!account || isUnsupportedNetwork) {
      back();
      return;
    }

    getAccountClaimData(account);
  }, [account, isUnsupportedNetwork]);

  const total = claimData?.total || 0;
  const polygonScanToken = toPolygonAddressUrl(
    process.env.NEXT_PUBLIC_CONTRACT_TOKEN || ""
  );
  const polygonScanAccount = toPolygonAddressUrl(account || "");
  const amountPerAddress =
    process.env.NEXT_PUBLIC_FAIRDROP_AMOUNT_PER_ADDRESS || "your";

  return (
    <>
      <section className={styles.airdrop}>
        <div className="container">
          <div className={styles.title}>
            <h2>Claim {amountPerAddress} $SPACE</h2>
          </div>
          <div className={styles.address}>
            Token Address:&nbsp;{" "}
            <a href={polygonScanToken.url} target="_blank" rel="noreferrer">
              {polygonScanToken.maskedAddress}
            </a>
            &nbsp;&nbsp;
            {canAddToMetaMask() && (
              <button
                className={styles.extra_btn}
                type="button"
                onClick={() => addTokenToMetaMask()}
              >
                Add $SPACE to MetaMask
              </button>
            )}
          </div>
          <div className={styles.address}>
            Wallet Address:&nbsp;
            <a href={polygonScanAccount.url} target="_blank" rel="noreferrer">
              {polygonScanAccount.maskedAddress}
            </a>
            &nbsp;&nbsp;
            <button
              className={styles.extra_btn}
              type="button"
              onClick={() => disconnect()}
            >
              Change
            </button>
          </div>

          {loading && <Spinner />}

          {!loading && claimData && total > 0 && (
            <div className={styles.content}>
              <ClaimTime
                isStarted={isStarted}
                days={days}
                hours={hours}
                minutes={minutes}
                seconds={seconds}
              />

              <ClaimDetail categories={claimData as any} total={total} />

              <ClaimButton
                isStarted={isStarted}
                total={total}
                proof={claimData.proof}
              />
            </div>
          )}

          {!loading && total <= 0 && <Empty />}
        </div>
      </section>
    </>
  );
};

export default Airdrop;
