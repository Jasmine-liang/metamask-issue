import Link from "next/link";

import styles from "./styles.module.sass";

const Footer = () => {
  return (
    <footer id={styles.footer}>
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6">
            <div className={styles.logo}>
              <Link href="/">
                <a className="d-block"></a>
              </Link>
            </div>
            <div className={styles.text}>
              <p>
                The Space is a pixel map where players can tokenize, own, trade
                and color pixels.
              </p>
              <p className="d-none d-md-block">
                Copyright © 2022 matters-lab.io
              </p>
            </div>
          </div>
          <div className="col-6 col-md-2 offset-md-1">
            <div className={styles.list}>
              <ul>
                <li>
                  <Link href="/">
                    <a>Home</a>
                  </Link>
                </li>
                <li>
                  <Link href="/claim">
                    <a>Claim $SPACE</a>
                  </Link>
                </li>
                {/* <li>
                  <a href="#" target="_blank" rel="noreferrer">
                    The Space playground
                  </a>
                </li> */}
                <li>
                  <a
                    href="https://matters.news/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Matters.news
                  </a>
                </li>
                <li>
                  <a
                    href="https://matters-lab.io/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Matters-lab.io
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className={styles.list}>
              <ul>
                <li>
                  <a
                    href="https://github.com/thematters/developer-resource"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </li>
                {/* <li>
                  <a href="#" target="_blank" rel="noreferrer">
                    Press Kit
                  </a>
                </li> */}
                {/* <li>
                  <a href="#" target="_blank" rel="noreferrer">
                    User Agreement
                  </a>
                </li>
                <li>
                  <a href="#" target="_blank" rel="noreferrer">
                    Privacy Policy
                  </a>
                </li> */}
              </ul>
            </div>
          </div>
          <div className="col-12">
            <div className={styles.social}>
              <a
                className={styles.twitter}
                href="https://twitter.com/thespace2022"
                target="_blank"
                rel="noreferrer"
              >
                <i className={styles.icon}></i>
              </a>
              <a
                className={styles.discord}
                href="https://discord.gg/thespace"
                target="_blank"
                rel="noreferrer"
              >
                <i className={styles.icon}></i>
              </a>
              {/* <a
                className={styles.telegram}
                href="https://t.me/joinchat/BXzlWUhXaWNZ-TXJZJCzDQ"
                target="_blank"
                rel="noreferrer"
              >
                <i className={styles.icon}></i>
              </a> */}
              <a
                className={styles.youtube}
                href="https://www.youtube.com/channel/UCC_rZ2vHqSy735e7K9I_TIg"
                target="_blank"
                rel="noreferrer"
              >
                <i className={styles.icon}></i>
              </a>
              <a
                className={styles.opensea}
                href="https://opensea.io/collection/space-game-test"
                target="_blank"
                rel="noreferrer"
              >
                <i className={styles.icon}></i>
              </a>
              <a
                className={styles.medium}
                href="https://matterslab.medium.com/"
                target="_blank"
                rel="noreferrer"
              >
                <i className={styles.icon}></i>
              </a>
              {/* <a
                className={styles.instagram}
                href="https://www.instagram.com/matterslab2018/"
                target="_blank"
                rel="noreferrer"
              >
                <i className={styles.icon}></i>
              </a>
              <a
                className={styles.facebook}
                href="https://www.facebook.com/MattersLab2018/"
                target="_blank"
                rel="noreferrer"
              >
                <i className={styles.icon}></i>
              </a> */}
              <a
                className={styles.github}
                href="https://github.com/thematters/developer-resource"
                target="_blank"
                rel="noreferrer"
              >
                <i className={styles.icon}></i>
              </a>
            </div>
          </div>
          <div className="col-12 d-md-none">
            <div className={`${styles.copyright} text-center`}>
              <span>Copyright © 2022 matters-lab.io</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
