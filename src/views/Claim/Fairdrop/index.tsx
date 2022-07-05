import React, { useEffect, useState } from "react";

import Steps from "./Steps";
import Results, { ResultStatus } from "./Results";
import { useAccount, useNetwork } from "wagmi";

export interface FairdropProps {
  back: () => void;
}

const Fairdrop: React.FC<FairdropProps> = ({ back }) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const account = address;
  const isUnsupportedNetwork = chain?.unsupported;

  const [resultStatus, setResultStatus] = useState<ResultStatus>("");

  useEffect(() => {
    if (!account || isUnsupportedNetwork) {
      back();
      return;
    }
  }, [account, isUnsupportedNetwork]);

  return (
    <>
      {resultStatus !== "" ? (
        <Results status={resultStatus} />
      ) : (
        <Steps setResultStatus={setResultStatus} />
      )}
    </>
  );
};

export default Fairdrop;
