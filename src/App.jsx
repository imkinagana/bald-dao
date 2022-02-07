import {ethers} from "ethers";
import {useEffect, useMemo, useState} from "react";
import {UnsupportedChainIdError} from "@web3-react/core";
import {useWeb3} from "@3rdweb/hooks";
import {ThirdwebSDK} from "@3rdweb/sdk";

const sdk = new ThirdwebSDK("rinkeby");

const bundleDropModule = sdk.getBundleDropModule("0xfd9aD6C5f7b4c63Fca1F258159d2F3C656E9203F");
const tokenModule = sdk.getTokenModule("0xBBb911Da2De88D452bbC509B0826fe89feced3da");
const voteModule = sdk.getVoteModule("0x1907d08f4fbA42a663B801D65082d06ebC5709AF");

const App = () => {
    const {connectWallet, address, error, provider} = useWeb3();
    console.log("👋 Address:", address)

    const signer = provider ? provider.getSigner() : undefined;

    const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
    const [memberAddresses, setMemberAddresses] = useState([]);

    const shortenAddress = (str) => {
        return str.substring(0, 6) + "..." + str.substring(str.length - 4);
    };

    const [proposals, setProposals] = useState([]);
    const [isVoting, setIsVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        if (!hasClaimedNFT) {
            return;
        }
        voteModule
            .getAll()
            .then((proposals) => {
                setProposals(proposals);
                console.log("🌈 Proposals:", proposals)
            })
            .catch((err) => {
                console.error("failed to get proposals", err);
            });
    }, [hasClaimedNFT]);

    useEffect(() => {
        if (!hasClaimedNFT) {
            return;
        }

        if (!proposals.length) {
            return;
        }

        voteModule
            .hasVoted(proposals[0].proposalId, address)
            .then((hasVoted) => {
                setHasVoted(hasVoted);
                if (hasVoted) {
                    console.log("🥵 User has already voted");
                } else {
                    console.log("🙂 User has not voted yet");
                }
            })
            .catch((err) => {
                console.error("failed to check if wallet has voted", err);
            });
    }, [hasClaimedNFT, proposals, address]);

    useEffect(() => {
        if (!hasClaimedNFT) {
            return;
        }

        bundleDropModule
            .getAllClaimerAddresses("0")
            .then((addresses) => {
                console.log("🚀 Members addresses", addresses)
                setMemberAddresses(addresses);
            })
            .catch((err) => {
                console.error("failed to get member list", err);
            });
    }, [hasClaimedNFT]);

    useEffect(() => {
        if (!hasClaimedNFT) {
            return;
        }

        tokenModule
            .getAllHolderBalances()
            .then((amounts) => {
                console.log("👜 Amounts", amounts)
                setMemberTokenAmounts(amounts);
            })
            .catch((err) => {
                console.error("failed to get token amounts", err);
            });
    }, [hasClaimedNFT]);

    const memberList = useMemo(() => {
        return memberAddresses.map((address) => {
            return {
                address, tokenAmount: ethers.utils.formatUnits(memberTokenAmounts[address] || 0, 18,),
            };
        });
    }, [memberAddresses, memberTokenAmounts]);

    useEffect(() => {
        sdk.setProviderOrSigner(signer);
    }, [signer]);

    useEffect(() => {
        if (!address) {
            return;
        }

        return bundleDropModule
            .balanceOf(address, "0")
            .then((balance) => {
                if (balance.gt(0)) {
                    setHasClaimedNFT(true);
                    console.log("🌟 this user has a membership NFT!")
                } else {
                    setHasClaimedNFT(false);
                    console.log("😭 this user doesn't have a membership NFT.")
                }
            })
            .catch((error) => {
                setHasClaimedNFT(false);
                console.error("failed to nft balance", error);
            });
    }, [address]);

    if (error instanceof UnsupportedChainIdError) {
        return (<div className="unsupported-network">
            <h2>Please connect to Rinkeby</h2>
            <p>
                This dapp only works on the Rinkeby network, please switch networks
                in your connected wallet.
            </p>
        </div>);
    }

    if (!address) {
        return (<div className="landing">
            <span className="bald-emoji">👨🏻‍🦲</span>
            <h1>Welcome to BaldDAO</h1>
            <button onClick={() => connectWallet("injected")} className="btn-hero">
                Connect your wallet
            </button>
        </div>);
    }

    if (hasClaimedNFT) {
        return (<div className="member-page">
            <span className="bald-emoji">👨🏻‍🦲</span>
            <h1>BaldDAO Member Page</h1>
            <p>Congratulations on being a member</p>
            <div>
                <div>
                    <h2>Member List</h2>
                    <table className="card">
                        <thead>
                        <tr>
                            <th>Address</th>
                            <th>Token Amount</th>
                        </tr>
                        </thead>
                        <tbody>
                        {memberList.map((member) => {
                            return (<tr key={member.address}>
                                <td>{shortenAddress(member.address)}</td>
                                <td>{member.tokenAmount}</td>
                            </tr>);
                        })}
                        </tbody>
                    </table>
                </div>
                <div>
                    <h2>Active Proposals</h2>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            //before we do async things, we want to disable the button to prevent double clicks
                            setIsVoting(true);

                            // lets get the votes from the form for the values
                            const votes = proposals.map((proposal) => {
                                let voteResult = {
                                    proposalId: proposal.proposalId, //abstain by default
                                    vote: 2,
                                };
                                proposal.votes.forEach((vote) => {
                                    const elem = document.getElementById(proposal.proposalId + "-" + vote.type);

                                    if (elem.checked) {
                                        voteResult.vote = vote.type;
                                    }
                                });
                                return voteResult;
                            });

                            try {
                                const delegation = await tokenModule.getDelegationOf(address);
                                if (delegation === ethers.constants.AddressZero) {
                                    await tokenModule.delegateTo(address);
                                }
                                try {
                                    await Promise.all(votes.map(async (vote) => {
                                        const proposal = await voteModule.get(vote.proposalId);
                                        if (proposal.state === 1) {
                                            return voteModule.vote(vote.proposalId, vote.vote);
                                        }
                                    }));
                                    try {
                                        await Promise.all(votes.map(async (vote) => {
                                            const proposal = await voteModule.get(vote.proposalId);
                                            if (proposal.state === 4) {
                                                return voteModule.execute(vote.proposalId);
                                            }
                                        }));
                                        setHasVoted(true);
                                        console.log("successfully voted");
                                    } catch (err) {
                                        console.error("failed to execute votes", err);
                                    }
                                } catch (err) {
                                    console.error("failed to vote", err);
                                }
                            } catch (err) {
                                console.error("failed to delegate tokens");
                            } finally {
                                setIsVoting(false);
                            }
                        }}
                    >
                        {proposals.map((proposal) => (<div key={proposal.proposalId} className="card">
                            <h5>{proposal.description}</h5>
                            <div>
                                {proposal.votes.map((vote) => (<div key={vote.type}>
                                    <input
                                        type="radio"
                                        id={proposal.proposalId + "-" + vote.type}
                                        name={proposal.proposalId}
                                        value={vote.type}
                                        defaultChecked={vote.type === 2}
                                    />
                                    <label htmlFor={proposal.proposalId + "-" + vote.type}>
                                        {vote.label}
                                    </label>
                                </div>))}
                            </div>
                        </div>))}
                        <button disabled={isVoting || hasVoted} type="submit">
                            {isVoting ? "Voting..." : hasVoted ? "You Already Voted" : "Submit Votes"}
                        </button>
                        <small>
                            This will trigger multiple transactions that you will need to
                            sign.
                        </small>
                    </form>
                </div>
            </div>
        </div>);
    }

    const mintNft = () => {
        setIsClaiming(true);
        bundleDropModule
            .claim("0", 1)
            .then(() => {
                setHasClaimedNFT(true);
                console.log(`🌊 Successfully Minted! Check it our on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address.toLowerCase()}/0`);
            })
            .catch((err) => {
                console.error("failed to claim", err);
            })
            .finally(() => {
                setIsClaiming(false);
            });
    }

    return (<div className="mint-nft">
        <span className="bald-emoji">👨🏻‍🦲</span>
        <h1>Mint your free BaldDAO Membership NFT</h1>
        <button
            disabled={isClaiming}
            onClick={() => mintNft()}
        >
            {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
        </button>
    </div>);
};

export default App;
