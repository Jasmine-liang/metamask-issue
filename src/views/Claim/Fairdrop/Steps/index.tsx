import { useState, useEffect } from "react";
import classNames from "classnames";
import {
  useAccount,
  useContractRead,
  useSignMessage,
  useContractWrite,
  useSendTransaction
} from "wagmi";

import Toast from "~/components/Toast";
import { fetchWrapper, getFairdropSignMessage, fairdropABI } from "~/utils";

import styles from "./styles.module.sass";

type StepsProps = {
  back: (val: any) => void;
};

type ClaimData = {
  account: string;
  nonce: string;
  expiredAt: number;
  signerSig: String;
};

const Steps: React.FC<StepsProps> = ({ back }) => {
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);
  const { data: accountData } = useAccount();
  const [claimData, setClaimData] = useState<ClaimData>();
  const [twitterUrl, setTwitterUrl] = useState("");
  const account = accountData?.address;

  // Verify Ethereum address
  const { 
    data: sigData,
    isSuccess: sigSuccess, 
    signMessage
  } = useSignMessage();

  useEffect(() => {
    if (!sigSuccess) {
      return;
    } else {
      setStep(2)
    }
  }, [sigSuccess]);

  // 連結錢包後檢查是否 claimed
  const { 
    data: claimedData,
  } = useContractRead(
    {
      addressOrName: process.env.FAIRDROP_CONTRACT || "",
      contractInterface: fairdropABI,
    },
    'addressClaimed',
    { args: account }
  )

  useEffect(() => {
    if (!account) {
      return;
    }
    if(claimedData){
      back("under_review");
    }
  }, [account]);

  // const { 
  //   data: userIdData, 
  //   isError: userIdError, 
  //   isLoading: userIdLoading,
  // } = useContractRead(
  //   {
  //     addressOrName: process.env.FAIRDROP_CONTRACT || "",
  //     contractInterface: fairdropABI,
  //   },
  //   'userIdClaimed',
  //   { args: userId } 
  // )

  const {
    data: claimTx,
    isSuccess: claimSuccess, 
    write,
  } = useContractWrite(
    {
      addressOrName: process.env.FAIRDROP_CONTRACT || "",
      contractInterface: fairdropABI,
    },
    "claim"
  );
  
  const verifyETHAddress = async () => {
    try {
      const data = await fetchWrapper.get(
        "/api/fairdrop/nonce?account=" + account
      )
      setClaimData(data);
      signMessage({
        message: getFairdropSignMessage({
          account: data.account || "",
          nonce: data.nonce || "",
          expiredAt: data.expiredAt || null
        }),
      });
    } catch (e) {
      // 已申請過
      // back("not_eligible");
      // back("under_review");
      // 無法申請
      // back("have_send");
    }
  };

  const verifyTwitterAccount = () => {
    const content = `Inspired by #RedditPlace, The Space is the world's #NFT #pixelart graffiti wall where players can own, color, and trade pixels under Harberger Tax and Universal Basic Income (UBI).\n#TheSpaceGame #烏塗邦\n\n💰Claim your $SPACE💰 at https://thespace.game/claim?nonce=${claimData?.nonce}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${window.encodeURIComponent(
        content
      )}`,
      "mywin",
      "left=0,top=0,width=650,height=650"
    );
    setStep(3);
  };

  const followUs = () => {
    window.open(
      "https://twitter.com/intent/follow?original_referer=https%3A%2F%2Fpublish.twitter.com%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5Ethespace2022&screen_name=thespace2022",
      "mywin",
      "left=0,top=0,width=650,height=650"
    );
    setStep(4);
  };
  
  const claimSpace = async () => {
    try {
      const data = await fetchWrapper.post(`/api/fairdrop/confirm`, {
        ...claimData,
        claimerSig: sigData,
        tweetURL: twitterUrl,
      });
      write()
    } catch (e) {
      // 已發過 tweet
      // back("already_posted");
    }
  };

  useEffect(() => {
    if (!claimSuccess) {
      return;
    }
    back("success")
  }, [claimSuccess]);

  const validateTwitter = () => {

  }

  const amountPerAddress =
    process.env.NEXT_PUBLIC_FAIRDROP_AMOUNT_PER_ADDRESS || "your";

  return (
    <section className={styles.steps}>
      {step === 2 && <Toast status="success" reason="Signed successfully" />}
      <div className="container">
        <div className={styles.title}>
          <h2>Claim {amountPerAddress} $SPACE</h2>
          <p>
            Congrats! You’re eligible to claim tokens. Here are instruction to
            proceed:
          </p>
        </div>
        <div className={styles.content}>
          <ol
            className={classNames({
              [styles.default]: step === 0,
              [styles.start]: step !== 0,
            })}
          >
            <li
              className={classNames({
                [styles.step1]: true,
                [styles.active]: step === 1,
                [styles.actived]: step > 1,
              })}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>Verify your Ethereum address</span>
                {step === 1 && (
                  <div className="buttons">
                    <button className="btn fill" onClick={verifyETHAddress}>
                      Verify
                    </button>
                  </div>
                )}
              </div>
            </li>
            <li
              className={classNames({
                [styles.step2]: true,
                [styles.active]: step === 2,
                [styles.actived]: step > 2,
              })}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>Verify your Twitter account</span>
                {step === 2 && (
                  <div className="buttons">
                    <button className="btn fill" onClick={verifyTwitterAccount}>
                      Verify
                    </button>
                  </div>
                )}
              </div>
            </li>
            <li
              className={classNames({
                [styles.step3]: true,
                [styles.active]: step === 3,
                [styles.actived]: step > 3,
              })}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>Follow us on Twitter</span>
                {step === 3 && (
                  <div className="buttons">
                    <button className="btn fill" onClick={followUs}>
                      Follow
                    </button>
                  </div>
                )}
              </div>
            </li>
            <li
              className={classNames({
                [styles.step4]: true,
                [styles.active]: step === 4,
              })}
            >
              <span>Copy and paste the tweet link and claim your $SPACE</span>
              {step === 4 && (
                <div className="d-flex justify-content-between align-items-center">
                  <input
                    className="form-control"
                    type="text"
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    required
                  />
                  <div className={`${styles.buttons} buttons`}>
                    <button
                      className="btn fill"
                      onClick={claimSpace}
                      disabled={twitterUrl === ""}
                    >
                      Claim
                    </button>
                  </div>
                </div>
              )}
            </li>
          </ol>
          {step === 0 && (
            <>
              <p>
                Once verification process completed, you will receive $SPACE
                token
              </p>
              <div className={styles.form_check}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  value=""
                  id="flexCheckChecked"
                  checked={checked}
                  onChange={() => setChecked(!checked)}
                />
                <label className="form-check-label" htmlFor="flexCheckChecked">
                  Use of this website constitutes acceptance of The Space{" "}
                  <a
                    href="https://wiki.thespace.game/the-space-terms-of-use-community-code-of-conduct "
                    target="_blank"
                    rel="noreferrer"
                  >
                    Term of Use
                  </a>
                  .
                </label>
              </div>
              <div className={`${styles.buttons} buttons text-end`}>
                <button
                  className="btn fill"
                  disabled={!checked}
                  onClick={() => setStep(1)}
                >
                  Get Started
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Steps;
