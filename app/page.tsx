import { ConnectButton } from "arweave-wallet-kit";

export default function Home() {
  return (
    <div>
      <ConnectButton showBalance={true} showProfilePicture={true} />
    </div>
  );
}
