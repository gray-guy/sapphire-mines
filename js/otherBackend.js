const sapphiremineAddress = '0x7146854856E3f373675105556c7D964B329606be';
const sapphiremine_ABI = JSON.parse(`[{"inputs":[{"internalType":"address payable","name":"_marketing","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"address","name":"ref","type":"address"}],"name":"buySapphires","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"eth","type":"uint256"},{"internalType":"uint256","name":"contractBalance","type":"uint256"}],"name":"calculateSapphireBuy","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"eth","type":"uint256"}],"name":"calculateSapphireBuySimple","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"sapphires","type":"uint256"}],"name":"calculateSapphireSell","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"getMyMiners","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"getMySapphires","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"getSapphiresSinceLastHarvest","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"ref","type":"address"}],"name":"harvestSapphires","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"openMines","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"sapphireRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sellSapphires","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]`);

const mainNetId = 137;
const web3 = window.web3;

let address = ""
let isWalletConnected = false;

let walletBalance = "0";
let sapphiremineContract;
let contractBalance = "0";
let sapphireBalance = "0";
let rewardsBalance = "0";

function format_address(addr) {
    return ('0x...' + addr.substring(addr.length - 4));
}

function callSnackBar (snackMessage, withTime) {
    if(withTime === true) {
        document.querySelector('#snack').style.display = "block";
        document.querySelector('#snacktext').innerHTML = snackMessage;
        setTimeout(() => {
            document.querySelector('#snack').style.display = "none";
            document.querySelector('#snacktext').innerHTML = "";
        }, 3000)
    } else if(withTime === false) {
        document.querySelector('#snack').style.display = "block";
        document.querySelector('#snacktext').innerHTML = snackMessage;
    }
}

function setIsConnectBtn(state) {
    if(state == true) {
        document.querySelector("#prepare").style.display = "none";
        document.querySelector("#connected").style.display = "block";
        document.querySelector('#btn-disconnect').innerHTML = format_address(address);

        document.getElementById('hire-miners').disabled = false;
        document.getElementById('hire-miners').classList.remove('app__hirebtndisabled');
        document.getElementById('hire-miners').classList.add('app__hirebtn');

        document.getElementById('rehire-miners').disabled = false;
        document.getElementById('rehire-miners').classList.remove('app__rewardsbtndisabled');
        document.getElementById('rehire-miners').classList.add('app__rewardsbtn');

        document.getElementById('collect').disabled = false;
        document.getElementById('collect').classList.remove('app__rewardsbtndisabled');
        document.getElementById('collect').classList.add('app__rewardsbtn');

        document.getElementById('create-ref').value = `https://sapphiremine.xyz/?ref=${address}`
    }
    else
    {
        document.querySelector("#prepare").style.display = "block";
        document.querySelector("#connected").style.display = "none";

        document.getElementById('hire-miners').disabled = true;
        document.getElementById('hire-miners').classList.add('app__hirebtndisabled');
        document.getElementById('hire-miners').classList.remove('app__hirebtn');

        document.getElementById('rehire-miners').disabled = true;
        document.getElementById('rehire-miners').classList.add('app__rewardsbtndisabled');
        document.getElementById('rehire-miners').classList.remove('app__rewardsbtn');

        document.getElementById('collect').disabled = true;
        document.getElementById('collect').classList.add('app__rewardsbtndisabled');
        document.getElementById('collect').classList.remove('app__rewardsbtn');

        document.getElementById('create-ref').value = `https://sapphiremine.xyz/?ref=`
    }
}

async function handleWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
        if(!isWalletConnected) {
            window.web3 = new Web3(window.ethereum);

            setIsConnectBtn(false);

            // <local storage or cookies>

            window.ethereum.request({ method: 'eth_requestAccounts' }).then((res) => {
            address = res[0];
            isWalletConnected = true;
            setIsConnectBtn(true);

            callSnackBar("Wallet Connected", true);

            loadAppData(res[0]);
            })
        } else {
            isWalletConnected = false;
            setIsConnectBtn(false);

            callSnackBar("Wallet Disconnected", true);

            address = "";
            walletBalance = "0";
            contractBalance = "0";
            sapphireBalance = "0";
            rewardsBalance = "0";
        }
    } 
    else {
        callSnackBar("Metamask is not installed", true);
    }
}

async function loadAppData(dataAddress) {
    const web3 = window.web3;

    web3.eth.getBalance(dataAddress).then((response) => {
    const bal = parseFloat(web3.utils.fromWei(response)).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
    walletBalance = bal;
    document.querySelector('#walletBalance').innerText = `${walletBalance} MATIC`;
    });

    const networkId = await web3.eth.net.getId()
    if (networkId === mainNetId) {
    const sapphiremine = await new web3.eth.Contract(sapphiremine_ABI, sapphiremineAddress)
    sapphiremineContract = sapphiremine;

    const getContractBal = await web3.eth.getBalance(sapphiremineAddress);
    contractBalance = parseFloat(web3.utils.fromWei(getContractBal)).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    document.querySelector('#contractBalance').innerText = `${contractBalance} MATIC`;

    const getSapphireBal = await sapphiremine.methods.getMySapphires(dataAddress).call()
    sapphireBalance = parseFloat(getSapphireBal).toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    document.querySelector('#sapphiresBalance').innerText = `${sapphireBalance} MATIC`;

    const getRewardsBal = await sapphiremine.methods.sapphireRewards(dataAddress).call()
    rewardsBalance = parseFloat(web3.utils.fromWei(getRewardsBal)).toString().match(/^-?\d+(?:\.\d{0,3})?/)[0];
    document.querySelector('#rewards').innerText = `${rewardsBalance} MATIC`;

    } else {
    await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89'}],
    }).then(() => {
        callSnackBar("Network switched: Polygon", true);

        loadAppData(address);
    })
    }
}

async function hireMiners() {
    setIsConnectBtn(true)

    callSnackBar("Hiring Miners", true);

    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let referral_wallet = urlParams.get('ref')
    
    if(referral_wallet == null)
        referral_wallet = "0x0000000000000000000000000000000000000000"

    let amount = getValues()

    try {
        await sapphiremineContract.methods.buySapphires(referral_wallet).send({
            from: address,
            value: amount * 10**18,
            maxPriorityFeePerGas: null,
            maxFeePerGas: null
        }).then((txHash) => {
            loadAppData(address);
            callSnackBar("Processinng...", true);
            console.log(`Transaction complete: https://polygonscan.com/tx/${txHash.transactionHash}`);
        });
    }
    catch(error) {
        callSnackBar("Transaction Failed", true);
    }
    finally {
        callSnackBar("Transaction Complete", true);
        setIsConnectBtn(true);
        loadAppData(address);
    }
}

async function rehireMiners() {
    setIsConnectBtn(true);

    callSnackBar("Rehiring Miners...", true);

    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let referral_wallet = urlParams.get('ref')
    
    if(referral_wallet == null)
        referral_wallet = "0x0000000000000000000000000000000000000000"

    try {
        await sapphiremineContract.methods.harvestSapphires(referral_wallet).send({
            from: address
        }).then((txHash) => {
            loadAppData(address);
            callSnackBar("Processing...", true);
            console.log(`Transaction complete: https://polygonscan.com/tx/${txHash.transactionHash}`);
        });
    }
    catch(error) {
        callSnackBar("Transaction Failed", true);
    }
    finally {
        callSnackBar("Transaction Complete", true);
        setIsConnectBtn(true);
        loadAppData(address);
    }
}

async function collect() {
    setIsConnectBtn(true);

    callSnackBar("Collecting rewards...", true);

    try {
        await sapphiremineContract.methods.sellSapphires().send({
            from: address
        }).then((txHash) => {
            loadAppData(address);
            callSnackBar("Processing...", true);
            console.log(`Transaction complete: https://polygonscan.com/tx/${txHash.transactionHash}`);
        });
    }
    catch(error) {
        callSnackBar("Transaction Failed", true);
    }
    finally {
        callSnackBar("Transaction Complete", true);
        setIsConnectBtn(true);
        loadAppData(address);
    }
}

function getValues() {
    let amount = document.querySelector('#input-matic').value;
    return amount;
}

window.addEventListener('load', async () => {
    handleWalletConnection();
    document.querySelector("#btn-connect").addEventListener("click", handleWalletConnection);
    document.querySelector("#btn-disconnect").addEventListener("click", handleWalletConnection);
    document.querySelector("#hire-miners").addEventListener("click", hireMiners);
    document.querySelector("#rehire-miners").addEventListener("click", rehireMiners);
    document.querySelector("#collect").addEventListener("click", collect);
});