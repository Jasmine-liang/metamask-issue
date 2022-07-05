import classNames from "classnames";
import { BigNumber, utils } from "ethers";
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractRead,
  useWaitForTransaction,
  useContractWrite,
} from "wagmi";
import Toast from "~/components/Toast";
import { addTokenToMetaMask, canAddToMetaMask, claimAirdropABI } from "~/utils";

import styles from "./styles.module.sass";

type ClaimButtonProps = {
  isStarted: boolean;
  total: number;
  proof: string[];
};

const ClaimButton: React.FC<ClaimButtonProps> = ({
  isStarted,
  total,
  proof,
}) => {
  const [isClaimed, setIsClaimed] = useState(false);
  const [success, setSuccess] = useState(false);

  const { address } = useAccount();
  const account = address;

  // read hasClaimed from contract
  const {
    data: hasClaimed,
    error,
    isLoading,
    refetch,
  } = useContractRead({
    addressOrName: process.env.NEXT_PUBLIC_CONTRACT_CLAIM || "",
    contractInterface: claimAirdropABI,
    functionName: "hasClaimed",
    enabled: false,
    args: [account],
  });

  // claim from contract
  const {
    data: claimTx,
    error: claimError,
    isLoading: isClaiming,
    write,
  } = useContractWrite({
    addressOrName: process.env.NEXT_PUBLIC_CONTRACT_CLAIM || "",
    contractInterface: claimAirdropABI,
    functionName: "claim",
    args: [
      account,
      utils.parseUnits(BigNumber.from(total).toString(), "18"),
      proof,
    ],
  });

  const { isLoading: isWaitingTx } = useWaitForTransaction({
    hash: claimTx?.hash,
    confirmations: 3,
    onSuccess(data) {
      setIsClaimed(true);
      setSuccess(true);
      console.log("Success", data);
    },
  });

  // re-check whether account is claimed
  useEffect(() => {
    if (!account) {
      return;
    }
    refetch();
  }, [account]);

  useEffect(() => {
    if (typeof hasClaimed !== "boolean") {
      return;
    }
    setIsClaimed(hasClaimed);
  }, [hasClaimed]);

  const classes = classNames({
    [styles.buttons]: true,
    buttons: true,
    "text-end": true,
  });

  const errorMessage = error?.message || claimError?.message;

  /**
   * Rendering
   */
  if (!isStarted) {
    return (
      <div className={classes}>
        <button className="btn fill disabled">Claim</button>
      </div>
    );
  }

  if (isLoading || isClaiming || isWaitingTx) {
    return (
      <div className={classes}>
        <button className={`${styles.loading} btn fill disabled`}>
          &nbsp;
        </button>
      </div>
    );
  }

  if (isClaimed) {
    return (
      <div className={classes}>
        {success && <Toast status="success" />}
        {errorMessage && <Toast status="failed" reason={errorMessage} />}
        {canAddToMetaMask() && (
          <button className="btn fill" onClick={() => addTokenToMetaMask()}>
            Add $SPACE to MetaMask
          </button>
        )}
        <button className="btn fill disabled">Claimed</button>
      </div>
    );
  }

  return (
    <div className={classes}>
      {success && <Toast status="success" />}
      {errorMessage && <Toast status="failed" reason={errorMessage} />}
      <button className="btn fill" onClick={() => write()}>
        Claim
      </button>
    </div>
  );
};

export default ClaimButton;
