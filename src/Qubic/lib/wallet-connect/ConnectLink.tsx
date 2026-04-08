import { MdLock, MdLockOpen } from "react-icons/md";
import ConnectModal from "./ConnectModal";
import { useQubicConnect } from "./QubicConnectContext";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const ConnectLink: React.FC<{ darkMode?: boolean }> = ({ darkMode }) => {
  const { connected, showConnectModal, toggleConnectModal } = useQubicConnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Button
        variant="default"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => toggleConnectModal()}
        type="button"
      >
        {connected ? (
          <>
            <MdLock size={20} />
            <span>Connected</span>
          </>
        ) : (
          <>
            <MdLockOpen size={20} />
            <span>Connect Wallet</span>
          </>
        )}
      </Button>
      {mounted &&
        createPortal(
          <ConnectModal open={showConnectModal} onClose={() => toggleConnectModal()} darkMode={darkMode} />,
          document.body,
        )}
    </>
  );
};

export default ConnectLink;
