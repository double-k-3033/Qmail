import { StyledQRCode } from "@/Qubic/lib/wallet-connect/qr-code";
import { QRCodePresets, downloadQRCode } from "@/Qubic/utils/qr-utils";
import { copyText } from "@/Qubic/utils/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useContext, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HeaderButtons } from "./Buttons";
import { MetaMaskContext } from "./MetamaskContext";
import { useQubicConnect } from "./QubicConnectContext";
import type { Account } from "./types";
import { useWalletConnect } from "./WalletConnectContext";
import AccountSelector from "@/Qubic/lib/wallet-connect/account-selector";

const ConnectModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [state] = useContext(MetaMaskContext);

  const [selectedMode, setSelectedMode] = useState("none");
  // Private seed handling
  const [privateSeed, setPrivateSeed] = useState("");
  const [errorMsgPrivateSeed, setErrorMsgPrivateSeed] = useState("");
  // Vault file handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [vaultError, setVaultError] = useState("");
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultAccounts, setVaultAccounts] = useState<Account[]>([]);
  // Context connect handling
  const { connect, disconnect, connected, mmSnapConnect, privateKeyConnect, vaultFileConnect } = useQubicConnect();
  // account selection
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState(0);
  // WC
  const [connectionURI, setConnectionURI] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const { connect: walletConnectConnect, isConnected, requestAccounts } = useWalletConnect();

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const generateURI = async () => {
    const { uri, approve } = await walletConnectConnect();
    setConnectionURI(uri);
    await approve();
  };

  useEffect(() => {
    if (isConnected) {
      const fetchAccounts = async () => {
        const accounts = await requestAccounts();
        setAccounts(
          accounts.map((account) => ({
            publicId: account.address,
            alias: account.name,
          })),
        );
        setSelectedMode("account-select");
      };
      fetchAccounts();
    }
  }, [isConnected]);

  // check if input is valid seed (55 chars and only lowercase letters)
  const privateKeyValidate = (pk: string) => {
    if (pk.length !== 55) {
      setErrorMsgPrivateSeed("Seed must be 55 characters long");
    }
    if (pk.match(/[^a-z]/)) {
      setErrorMsgPrivateSeed("Seed must contain only lowercase letters");
    }
    if (pk.length === 55 && !pk.match(/[^a-z]/)) {
      setErrorMsgPrivateSeed("");
    }
    setPrivateSeed(pk);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value.toString());

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed top-0 left-0 z-50 flex h-full w-full overflow-x-hidden overflow-y-auto bg-app-bg/70 p-5 backdrop-blur-sm"
          onClick={() => {
            setSelectedMode("none");
            onClose();
          }}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="relative m-auto flex w-full max-w-md flex-col"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <Card className="bg-background text-foreground p-8">
              <motion.div className="flex items-center justify-between" variants={contentVariants}>
                <img
                  src={isDark ? "/qubic-connect.svg" : "/qubic-connect-dark.svg"}
                  alt="Qubic Connect Logo"
                  className="h-6"
                />
                <IoClose onClick={onClose} className="h-5 w-5 cursor-pointer text-foreground" />
              </motion.div>

              <AnimatePresence mode="wait">
                {selectedMode === "none" && (
                  <motion.div
                    className="mt-4 flex flex-col gap-4"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {connected && (
                      <Button variant="default" className="mt-4" onClick={() => disconnect()}>
                        Disconnect Wallet
                      </Button>
                    )}
                    {!connected && (
                      <>
                        <Button
                          variant="default"
                          className="mt-4 flex items-center justify-center gap-3"
                          onClick={() => setSelectedMode("metamask")}
                        >
                          <img src={"/metamask.svg"} alt="MetaMask Logo" className="h-8 w-8" />
                          <span className="w-32">MetaMask</span>
                        </Button>
                        <Button
                          variant="default"
                          className="flex items-center justify-center gap-3"
                          onClick={() => {
                            generateURI();
                            setSelectedMode("walletconnect");
                          }}
                        >
                          <img src={"/wallet-connect.svg"} alt="Wallet Connect Logo" className="h-8 w-8" />
                          <span className="w-32">Wallet Connect</span>
                        </Button>
                        <div className="my-1 flex w-full items-center gap-3">
                          <div className="flex-grow border-t border-border" />
                          <span className="text-xs text-muted-foreground">or</span>
                          <div className="flex-grow border-t border-border" />
                        </div>
                        <Button variant="outline" onClick={() => setSelectedMode("private-seed")}>
                          Private Seed
                        </Button>
                        <Button variant="outline" onClick={() => { setVaultError(""); setSelectedMode("vault-file"); }}>
                          Vault File
                        </Button>
                      </>
                    )}
                  </motion.div>
                )}

                {selectedMode === "private-seed" && (
                  <motion.div
                    className="mt-4 space-y-2"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <p className="text-sm text-muted-foreground">Your 55-character private seed (lowercase letters only):</p>
                    <Input
                      type="password"
                      value={privateSeed}
                      placeholder="abcdefghijklmnopqrstuvwxyz..."
                      onChange={(e) => privateKeyValidate(e.target.value)}
                    />
                    {errorMsgPrivateSeed && <p className="text-sm text-destructive">{errorMsgPrivateSeed}</p>}
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" onClick={() => { setSelectedMode("none"); setPrivateSeed(""); setErrorMsgPrivateSeed(""); }}>
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        disabled={privateSeed.length !== 55 || !!errorMsgPrivateSeed}
                        onClick={async () => {
                          await privateKeyConnect(privateSeed);
                          setSelectedMode("none");
                          setPrivateSeed("");
                          onClose();
                        }}
                      >
                        Unlock
                      </Button>
                    </div>
                  </motion.div>
                )}

                {selectedMode === "vault-file" && (
                  <motion.div
                    className="mt-4 space-y-2"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <p className="text-sm text-muted-foreground">Load your Qubic vault file:</p>
                    <Input type="file" accept=".qubic-vault,.vault" onChange={handleFileChange} />
                    <Input type="password" placeholder="Enter password" onChange={handlePasswordChange} />
                    {vaultError && <p className="text-sm text-destructive">{vaultError}</p>}
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" onClick={() => setSelectedMode("none")}>
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        disabled={vaultLoading || !selectedFile || !password}
                        onClick={async () => {
                          if (!selectedFile) return;
                          setVaultError("");
                          setVaultLoading(true);
                          try {
                            const vault = await vaultFileConnect(selectedFile, password);
                            const seeds: Account[] = vault.getSeeds
                              ? vault.getSeeds().map((s: any, i: number) => ({
                                  publicId: s.publicId ?? s.publicKey ?? s.address ?? "",
                                  alias: s.alias ?? s.description ?? `Account ${i + 1}`,
                                }))
                              : [];
                            setVaultAccounts(seeds);
                            setAccounts(seeds);
                            setSelectedMode("account-select-vault");
                          } catch (err) {
                            setVaultError(
                              err instanceof Error
                                ? err.message
                                : "Failed to unlock vault. Check your password and try again.",
                            );
                          } finally {
                            setVaultLoading(false);
                          }
                        }}
                      >
                        {vaultLoading ? "Unlocking…" : "Unlock"}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {selectedMode === "account-select" && (
                  <motion.div
                    className="mt-4 text-muted-foreground"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    Select an account:
                    <AccountSelector
                      label={"Account"}
                      options={accounts.map((account, idx) => ({
                        label: account.alias || `Account ${idx + 1}`,
                        value: account.publicId,
                      }))}
                      selected={selectedAccount}
                      setSelected={setSelectedAccount}
                    />
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <Button
                        variant="default"
                        className="mt-4"
                        onClick={() => {
                          disconnect();
                          setSelectedMode("none");
                        }}
                      >
                        Lock Wallet
                      </Button>
                      <Button
                        variant="default"
                        className="mt-4"
                        onClick={() => {
                          connect({
                            connectType: "walletconnect",
                            publicKey: accounts[parseInt(selectedAccount.toString())]?.publicId,
                            alias: accounts[parseInt(selectedAccount.toString())]?.alias,
                          });
                          setSelectedMode("none");
                          onClose();
                        }}
                      >
                        Select Account
                      </Button>
                    </div>
                  </motion.div>
                )}

                {selectedMode === "account-select-vault" && (
                  <motion.div
                    className="mt-4 text-muted-foreground"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <p className="mb-2 text-sm">Select an account from your vault:</p>
                    <AccountSelector
                      label="Account"
                      options={vaultAccounts.map((account, idx) => ({
                        label: account.alias || `Account ${idx + 1}`,
                        value: account.publicId,
                      }))}
                      selected={selectedAccount}
                      setSelected={setSelectedAccount}
                    />
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <Button variant="outline" onClick={() => setSelectedMode("vault-file")}>
                        Back
                      </Button>
                      <Button
                        variant="default"
                        disabled={!vaultAccounts[selectedAccount]}
                        onClick={() => {
                          connect({
                            connectType: "vaultFile",
                            publicKey: vaultAccounts[selectedAccount]?.publicId ?? "",
                            alias: vaultAccounts[selectedAccount]?.alias ?? "",
                          });
                          setSelectedMode("none");
                          onClose();
                        }}
                      >
                        Select Account
                      </Button>
                    </div>
                  </motion.div>
                )}

                {selectedMode === "metamask" && (
                  <motion.div
                    className="mt-4 text-muted-foreground"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    Connect your MetaMask wallet. You need to have MetaMask installed and unlocked.
                    <div className="mt-5 flex flex-col gap-2">
                      <HeaderButtons
                        state={state}
                        connected={connected}
                        onConnectClick={() => {
                          mmSnapConnect();
                          setSelectedMode("none");
                          onClose();
                        }}
                      />
                      <Button variant="outline" className="text-primary" onClick={() => setSelectedMode("none")}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}

                {selectedMode === "walletconnect" && (
                  <motion.div
                    className="mt-4 text-muted-foreground"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    Connect your Qubic Wallet. You need to have Qubic Wallet installed and unlocked.
                    <div className="mt-5 flex flex-col gap-2">
                      <div className="flex min-h-54 min-w-54 flex-col items-center justify-center">
                        {connectionURI ? (
                          <StyledQRCode
                            value={connectionURI}
                            options={{
                              ...QRCodePresets.walletConnect,
                              color: {
                                dark: isDark ? "#71eafc" : "#111720",
                                light: isDark ? "#232c3b" : "#ffffff",
                              },
                              borderColor: isDark ? "#2a3444" : "#cbd5e1",
                              shadowColor: isDark ? "rgba(113, 234, 252, 0.1)" : "rgba(15, 23, 42, 0.08)",
                              backgroundColor: "transparent",
                            }}
                            className="mx-auto transition-all duration-300 hover:scale-105"
                            onGenerated={(dataUrl) => setQrDataUrl(dataUrl)}
                            onError={(error) => console.error("QR generation error:", error)}
                          />
                        ) : (
                          <div className="border-foreground mx-auto h-8 w-8 animate-spin rounded-full border-t-2"></div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyText(connectionURI)}
                          disabled={!connectionURI}
                          className="text-primary text-xs"
                        >
                          Copy URI
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => qrDataUrl && downloadQRCode(qrDataUrl, "wallet-connect-qr.png")}
                          disabled={!qrDataUrl}
                          className="text-primary text-xs"
                        >
                          Download QR
                        </Button>
                      </div>
                      <Button
                        variant="default"
                        className="flex items-center justify-center gap-3"
                        onClick={() => window.open(`qubic-wallet://pairwc/${connectionURI}`, "_blank")}
                        disabled={!connectionURI}
                      >
                        Open in Qubic Wallet
                      </Button>
                      <Button variant="outline" className="text-primary" onClick={() => setSelectedMode("none")}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectModal;
