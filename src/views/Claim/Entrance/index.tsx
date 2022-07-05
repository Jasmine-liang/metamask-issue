import { useEffect } from "react";
import { useConnect, useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import classNames from "classnames";

import { injectedConnector, walletConnectConnector } from "~/utils";

import styles from "./styles.module.sass";

type EntranceProps = {
  next: () => void;
};

const amountPerAddress =
  process.env.NEXT_PUBLIC_FAIRDROP_AMOUNT_PER_ADDRESS || "your";

const Entrance: React.FC<EntranceProps> = ({ next }) => {
  const {
    connectors,
    connect,
    error: connectError,
    isLoading,
    pendingConnector,
  } = useConnect();
  const { address, connector } = useAccount();
  const { chain } = useNetwork();
  const { chains, error: networkError, switchNetwork } = useSwitchNetwork();

  const account = address;
  const isUnsupportedNetwork = !!chain?.unsupported;
  const targetChainName = chains[0]?.name;
  const targetChainId = chains[0]?.id;
  const errorMessage = connectError?.message || networkError?.message;

  const switchToTargetNetwork = async () => {
    if (!switchNetwork) return;

    switchNetwork(targetChainId);
  };

  // go forward if wallet is connected
  useEffect(() => {
    if (!account || isUnsupportedNetwork) {
      return;
    }

    next();
  }, [account, isUnsupportedNetwork]);

  const metaMaskClasses = classNames({
    [styles.connect_btn]: true,
    [styles.metamask]: true,
    [styles.disabled]: isUnsupportedNetwork,
    [styles.connecting]:
      isLoading && pendingConnector?.id === injectedConnector.id,
    [styles.active]: connectors[0]?.id === injectedConnector.id,
  });
  const walletConnectClasses = classNames({
    [styles.connect_btn]: true,
    [styles.walletconnect]: true,
    [styles.disabled]: isUnsupportedNetwork,
    [styles.connecting]:
      isLoading && pendingConnector?.id === walletConnectConnector.id,
    [styles.active]: connectors[0]?.id === walletConnectConnector.id,
  });
  return (
    <>
      <section className={`${styles.entrance} text-center`}>
        <div className={styles.illu}>
          <figure>
            <img className="img-fluid" src="/img/entrance-illu-1.svg" />
          </figure>
        </div>
        <div className={`${styles.container} container`}>
          <div className={styles.title}>
            <h2>Claim {amountPerAddress} $SPACE</h2>
          </div>
          <div className={styles.text}>
            <span>
              Before claiming $SPACE, let&apos;s connect your wallet first.
            </span>
          </div>

          <div className={styles.wallet}>
            <div className={styles.connect_btn_wrapper}>
              {injectedConnector?.ready && (
                <button
                  className={metaMaskClasses}
                  onClick={() => connect({ connector: injectedConnector })}
                >
                  MetaMask
                </button>
              )}

              {isUnsupportedNetwork &&
                connectors[0]?.id === injectedConnector.id && (
                  <span
                    className={styles.switch_nwtwork}
                    role="button"
                    onClick={switchToTargetNetwork}
                  >
                    Switch to {targetChainName}
                  </span>
                )}
            </div>

            <div className={styles.connect_btn_wrapper}>
              <button
                className={walletConnectClasses}
                onClick={() => connect({ connector: walletConnectConnector })}
              >
                WalletConnect
              </button>

              {isUnsupportedNetwork &&
                connectors[0]?.id === walletConnectConnector.id && (
                  <span
                    className={styles.switch_nwtwork}
                    role="button"
                    onClick={switchToTargetNetwork}
                  >
                    Switch to {targetChainName}
                  </span>
                )}
            </div>

            <section className={styles.swap}>
              <div className={styles.divider}>or</div>
              <a
                className={styles.uniswap_btn}
                target="_blank"
                rel="noreferrer"
                href={process.env.NEXT_PUBLIC_SWAP_SPACE_URL}
              >
                Swap on Uniswap
              </a>
            </section>

            {errorMessage && (
              <p className={styles.error}>
                {errorMessage ?? "Failed to connect"}
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Entrance;
