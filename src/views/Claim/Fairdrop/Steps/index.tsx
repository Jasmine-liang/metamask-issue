import { useState, useEffect } from "react";
import classNames from "classnames";
import {
  useAccount,
  useContractRead,
  useDisconnect,
  useSignMessage,
  useContractWrite,
  useBalance,
  useWaitForTransaction,
} from "wagmi";
import { CopyToClipboard } from "react-copy-to-clipboard";

import Toast from "~/components/Toast";
import {
  fetchWrapper,
  getFairdropSignMessage,
  fairdropABI,
  isTweetURL,
  addTokenToMetaMask,
  canAddToMetaMask,
  toPolygonAddressUrl,
} from "~/utils";

import styles from "./styles.module.sass";
import { ResultStatus } from "../Results";

type StepsProps = {
  setResultStatus: (val: ResultStatus) => void;
};

type ClaimData = {
  account: string;
  nonce: string;
  userId?: string;
  expiredAt: number;
  signerSig: String;
  sigV?: string;
  sigR?: string;
  sigS?: string;
};

const amountPerAddress =
  process.env.NEXT_PUBLIC_FAIRDROP_AMOUNT_PER_ADDRESS || "your";

const getAPIErrorMessage = (code: string) => {
  const msg = {
    INTERNAL_ERROR:
      "A server error occurred while processing the request, please retry.",
    INVALID_ACCOUNT: "Wallet address is invalid.",
    INVALID_NONCE: "Nonce is invalid, please retry.",
    INVALID_SIGNATURE: "Signature is invalid, please retry.",
    INVALID_TWEET_URL:
      "Please provide a tweet url that Twitter account has never claimed.",
    INELIGIBLE_USER:
      "Your Twitter account is ineligible to claim the fairdrop.",
    CLAIM_EXPIRED: "Fairdrop claim has expired, please retry.",
  };

  return msg[code as keyof typeof msg] || msg.INTERNAL_ERROR;
};

const Steps: React.FC<StepsProps> = ({ setResultStatus }) => {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const account = address;
  const {
    data: balanceData,
    error: balanceError,
    refetch: balanceRefetch,
    isLoading: balanceLoading,
  } = useBalance({
    addressOrName: account,
  });

  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);

  const [apiError, setAPIError] = useState("");
  const [apiLoading, setAPILoading] = useState(false);

  const [isCopied, setIsCopied] = useState(false);
  const [twitterValidate, setTwitterValidate] = useState(false);
  const [twitterUrl, setTwitterUrl] = useState("");
  const [claimData, setClaimData] = useState<ClaimData>();

  const [popup, setPopup] = useState(false);

  // Verify Ethereum address
  const {
    data: sigData,
    error: sigError,
    isSuccess: sigSuccess,
    isLoading: sigLoading,
    signMessage,
  } = useSignMessage();

  // Check if address is already claimed
  const { data: isAddressClaimed } = useContractRead({
    addressOrName: process.env.NEXT_PUBLIC_FAIRDROP_CONTRACT || "",
    contractInterface: fairdropABI,
    functionName: "addressClaimed",
    args: account,
  });

  // Check if userId (Twitter account) is already claimed
  const { data: isUserIdClaimed } = useContractRead({
    addressOrName: process.env.NEXT_PUBLIC_FAIRDROP_CONTRACT || "",
    contractInterface: fairdropABI,
    functionName: "userIdClaimed",
    args: claimData?.userId,
  });

  // Claim fairdrop
  const {
    data: claimTx,
    error: claimError,
    // isSuccess: claimSuccess,
    isLoading: claimLoading,
    write,
  } = useContractWrite({
    addressOrName: process.env.NEXT_PUBLIC_FAIRDROP_CONTRACT || "",
    contractInterface: fairdropABI,
    functionName: "claim",
  });

  // wait claimging transaction
  const { isLoading: isWaitingTx } = useWaitForTransaction({
    hash: claimTx?.hash,
    confirmations: 3,
    onSuccess(data) {
      setPopup(true);
      console.log("Success", data);
    },
  });

  const verifyETHAddress = async () => {
    setAPILoading(true);
    setAPIError("");

    try {
      const data = await fetchWrapper.get(
        "/api/fairdrop/nonce?account=" + account
      );
      setClaimData({ ...claimData, ...data });
      signMessage({
        message: getFairdropSignMessage({
          account: data.account || "",
          nonce: data.nonce || "",
          expiredAt: data.expiredAt || null,
        }),
      });
    } catch (error) {
      // API error handling
      const code = (error as any)?.code;
      setAPIError(getAPIErrorMessage(code));
    }
    setAPILoading(false);
  };

  const tweetContent = `Inspired by #RedditPlace, The Space is the world's first #NFT #pixelart graffiti wall where players can own, color, and trade pixels under Harberger Tax and Universal Basic Income (UBI).\n#TheSpaceGame #烏塗邦\n\n💰Claim your $SPACE💰 at: https://thespace.game/claim?nonce=${claimData?.nonce}`;

  const sendTweet = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${window.encodeURIComponent(
        tweetContent
      )}`,
      "mywin",
      "left=0,top=0,width=650,height=650"
    );
  };

  const followUs = () => {
    window.open(
      "https://twitter.com/intent/follow?original_referer=https%3A%2F%2Fpublish.twitter.com%2F&ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5Ethespace2022&screen_name=thespace2022",
      "mywin",
      "left=0,top=0,width=650,height=650"
    );
    setResultStatus("success");
  };

  const validateTwitter = (url: string) => {
    const validate = isTweetURL(url);
    setTwitterValidate(validate);
    setTwitterUrl(url);
  };

  const claimSpace = async () => {
    setAPILoading(true);
    setAPIError("");

    try {
      const data = await fetchWrapper.post("/api/fairdrop/confirm", {
        account: claimData?.account,
        nonce: claimData?.nonce,
        expiredAt: claimData?.expiredAt,
        signerSig: claimData?.signerSig,
        claimerSig: sigData,
        tweetURL: twitterUrl,
      });
      setClaimData({ ...claimData, ...data });
      write({
        args: [
          data.account,
          data.userId,
          data.nonce,
          data.expiredAt,
          data.sigV,
          data.sigR,
          data.sigS,
        ],
      });
    } catch (error) {
      // API error handling
      const code = (error as any)?.code;
      setAPIError(getAPIErrorMessage(code));
    }

    setAPILoading(false);
  };

  /**
   * Status
   */
  useEffect(() => {
    if (sigSuccess) {
      setStep(2);
    }
  }, [sigSuccess]);

  useEffect(() => {
    if (isAddressClaimed || isUserIdClaimed) {
      setResultStatus("already_claimed");
    }
  }, [isAddressClaimed, isUserIdClaimed]);

  const isLoading =
    balanceLoading || apiLoading || sigLoading || claimLoading || isWaitingTx;
  const error =
    balanceError?.message ||
    apiError ||
    sigError?.message ||
    claimError?.message;

  const polygonScanToken = toPolygonAddressUrl(
    process.env.NEXT_PUBLIC_CONTRACT_TOKEN || ""
  );
  const polygonScanAccount = toPolygonAddressUrl(account || "");
  const hasMatic = balanceData?.value.gt(0);

  /**
   * Rendering
   */
  return (
    <section className={styles.steps}>
      {sigSuccess && <Toast status="success" reason="Signed successfully" />}
      {isCopied && <Toast status="success" reason="Copied" />}
      {error && <Toast status="failed" reason={error} />}

      {popup && (
        <div className={`${styles.popup} text-center`}>
          <div
            className={styles.bg}
            onClick={() => {
              setPopup(false);
            }}
          ></div>
          <div className={styles.content}>
            <button
              className={styles.close}
              onClick={() => {
                setPopup(false);
              }}
            ></button>
            <div className={styles.title}>
              <h2>Claim Successfully</h2>
              <p>
                We've sent $SPACE to your wallet. Please remember to add$SPACE
                to MetaMask. Let's go launch app.
              </p>
            </div>
            <div className={styles.illu}>
              <figure>
                <img className="img-fluid" src="/img/results-illu-3.svg" />
              </figure>
            </div>
            <div className="buttons">
              <button className="btn fill" onClick={followUs}>
                Follow our twitter and complete process
              </button>
            </div>
          </div>
        </div>
      )}

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

        <div className={styles.content}>
          <p>
            Congrats! You&apos;re eligible to claim $SPACE tokens. Here are
            instructions to proceed:
          </p>

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
                <span>Verify your wallet address</span>
                {step === 1 && (
                  <div className="buttons">
                    {isLoading ? (
                      <button className={`${styles.loading} btn fill disabled`}>
                        &nbsp;
                      </button>
                    ) : (
                      <button className="btn fill" onClick={verifyETHAddress}>
                        Verify
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
            <li
              className={classNames({
                [styles.step2]: true,
                [styles.active]: step === 2,
                // [styles.actived]: step > 2,
              })}
            >
              <div className="d-flex flex-column align-items-start">
                <span>
                  Tweet to verify your Twitter account and claim{" "}
                  {amountPerAddress} $SPACE
                </span>
                {step === 2 && (
                  <>
                    <section className={`${styles.sub_step}`}>
                      <p>
                        Step1: Copy content, post a tweet. And copy tweet link
                      </p>
                      <div className={styles.tweet_content}>{tweetContent}</div>
                      <div
                        className={`${styles.buttons} buttons d-flex justify-content-between align-items-center`}
                      >
                        <p />
                        <div>
                          <CopyToClipboard
                            text={tweetContent}
                            onCopy={() => {
                              setIsCopied(true);
                              setTimeout(() => {
                                setIsCopied(false);
                              }, 5000);
                            }}
                          >
                            <button className={`btn fill ${styles.copy_btn}`}>
                              Copy
                            </button>
                          </CopyToClipboard>

                          <button
                            className={`btn fill ${styles.send_btn}`}
                            onClick={sendTweet}
                          >
                            Send Tweet
                          </button>
                        </div>
                      </div>
                    </section>

                    <section className={`${styles.sub_step}`}>
                      <p>Step2: Paste tweet link here </p>
                      <input
                        className="form-control"
                        type="text"
                        onChange={(e) => validateTwitter(e.target.value)}
                        required
                        placeholder="https://twitter.com/thespace2022/status/1534453835934355456"
                      />
                      <div
                        className={`${styles.buttons} buttons d-flex justify-content-between align-items-center text-end`}
                      >
                        <p />
                        {isLoading ? (
                          <button
                            className={`${styles.loading} btn fill disabled`}
                          >
                            &nbsp;
                          </button>
                        ) : (
                          <button className="btn fill" onClick={claimSpace}>
                            Claim
                          </button>
                        )}
                      </div>
                    </section>
                  </>
                )}
              </div>
            </li>
          </ol>
          {step === 0 && (
            <>
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
              <div
                className={`${styles.opening_footer} buttons d-flex justify-content-between align-items-center text-end`}
              >
                {!hasMatic ? (
                  <p className={styles.error}>
                    You don&apos;t have enough $MATIC to finish the claim
                    process.
                  </p>
                ) : (
                  <p />
                )}
                {isLoading ? (
                  <button className={`${styles.loading} btn fill disabled`}>
                    &nbsp;
                  </button>
                ) : hasMatic ? (
                  <button
                    className="btn fill"
                    disabled={!checked}
                    onClick={() => setStep(1)}
                  >
                    Get Started
                  </button>
                ) : (
                  <button className="btn fill" onClick={() => balanceRefetch()}>
                    Retry
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Steps;
