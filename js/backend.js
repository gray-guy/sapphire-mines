const sapphiremineAddress = '0x6398628AE6e2039E13bA5a3CdfC4229bDd1a3054';
const sapphiremine_ABI = JSON.parse(`[{"inputs":[{"internalType":"address payable","name":"_marketing","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"address","name":"ref","type":"address"}],"name":"buySapphires","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"eth","type":"uint256"},{"internalType":"uint256","name":"contractBalance","type":"uint256"}],"name":"calculateSapphireBuy","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"eth","type":"uint256"}],"name":"calculateSapphireBuySimple","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"sapphires","type":"uint256"}],"name":"calculateSapphireSell","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"getMyMiners","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"getMySapphires","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"getSapphiresSinceLastHarvest","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"ref","type":"address"}],"name":"harvestSapphires","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"openMines","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"adr","type":"address"}],"name":"sapphireRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sellSapphires","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]`);

let sapphiremineContract;

const Web3Modal = window.Web3Modal.default;

let web3Modal;
let web3, provider, accounts;
let selectedAccount;

function init_wallet() {
  web3Modal = new Web3Modal({
    cacheProvider: false,
    disableInjectedProvider: false
  });
}

async function onConnect() {
  try {
    provider = await web3Modal.connect();
    console.log("Connected")
  } catch (e) {
    console.log("Could not get a wallet connection", e);
    return;
  }

  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });

  provider.on("chainChanged", (chainId) => {
    fetchAccountData();
  });

  provider.on("networkChanged", (networkId) => {
    fetchAccountData();
  });

  await refreshAccountData();
}

async function onDisconnect() {
  if (provider.close) {
    await provider.close();
    await web3Modal.clearCachedProvider();
    provider = null;
    console.log("Disconnected")
  }
  selectedAccount = null;
  document.querySelector("#prepare").style.display = "block";
  document.querySelector("#connected").style.display = "none";
}

async function fetchAccountData() {
    web3 = new Web3(provider);
    accounts = await web3.eth.getAccounts();
    selectedAccount = accounts[0];

    document.querySelector("#prepare").style.display = "none";
    document.querySelector("#connected").style.display = "block";
    document.querySelector('#btn-disconnect').innerHTML = format_address(selectedAccount);

    document.getElementById('hire-miners').disabled = false;
    document.getElementById('hire-miners').classList.remove('app__hirebtndisabled');
    document.getElementById('hire-miners').classList.add('app__hirebtn');

    document.getElementById('rehire-miners').disabled = false;
    document.getElementById('rehire-miners').classList.remove('app__rewardsbtndisabled');
    document.getElementById('rehire-miners').classList.add('app__rewardsbtn');

    document.getElementById('collect').disabled = false;
    document.getElementById('collect').classList.remove('app__rewardsbtndisabled');
    document.getElementById('collect').classList.add('app__rewardsbtn');

    document.getElementById('create-ref').value = `https://www.rubymine.money?ref=${selectedAccount}`

    sapphiremineContract = new web3.eth.Contract(sapphiremine_ABI, sapphiremineAddress);

    getContractBalance();
    getWalletBalance(selectedAccount);
    getSapphiresBalance(selectedAccount);
    getRewards(selectedAccount);
}

async function refreshAccountData() {
  document.querySelector("#connected").style.display = "none";
  document.querySelector("#prepare").style.display = "block";
  document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  await fetchAccountData();
  document.querySelector("#btn-connect").removeAttribute("disabled")
}

function format_address(addr) {
  return ('0x...' + addr.substring(addr.length - 4));
}

async function getContractBalance() {
    let balance = await web3.eth.getBalance('0x6398628AE6e2039E13bA5a3CdfC4229bDd1a3054');
    let rounded_balance = (balance / 10**18).toFixed(2);
    console.log("Contract balance: " + rounded_balance);
    document.querySelector('#contractBalance').innerText = `${rounded_balance} MATIC`;
}

async function getWalletBalance(selectedAccount) {
    let balance = await web3.eth.getBalance(selectedAccount);
    let rounded_balance = (balance / 10**18).toFixed(2);
    console.log("Wallet balance: " + rounded_balance);
    document.querySelector('#walletBalance').innerText = `${rounded_balance} MATIC`;
}

async function getSapphiresBalance(holder_wallet) {
    let balance = await sapphiremineContract.methods.getMySapphires(holder_wallet).call();
    // let rounded_balance = (balance / 10**18).toFixed(2)
    console.log("Sapphires: " + balance);
    document.querySelector('#sapphiresBalance').innerText = `${balance} SAPPHIRES`;
}

async function getRewards(holder_wallet) {
    let balance = await sapphiremineContract.methods.sapphireRewards(holder_wallet).call();
    let rounded_balance = (balance / 10**18).toFixed(5);
    console.log("Rewards: " + rounded_balance);
    document.querySelector('#rewards').innerText = `${rounded_balance} MATIC`;
}

async function hireMiners() {
    console.log("Hire Miners");
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let referral_wallet = urlParams.get('ref')
    
    if(referral_wallet == null)
        referral_wallet = selectedAccount

    let amount = getValues()
    console.log("Amount: " + amount);
    console.log("Referral wallet: " + referral_wallet);
    try {
        await sapphiremineContract.methods.buySapphires(referral_wallet).send({
            from: selectedAccount,
            value: amount * 10**18 
        }).then((txHash) => {
            alert(`Transaction complete: https://etherscan.io/tx/${txHash.transactionHash}`);
        });
    }
    catch(error) {
        alert(error.message);
    }
}

async function rehireMiners() {
    console.log("Rehire Miners");
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let referral_wallet = urlParams.get('ref')
    
    if(referral_wallet == null)
        referral_wallet = selectedAccount

    console.log("Referral wallet: " + referral_wallet);
    try {
        await sapphiremineContract.methods.harvestSapphires(referral_wallet).send({
            from: selectedAccount
        }).then((txHash) => {
            alert(`Transaction complete: https://etherscan.io/tx/${txHash.transactionHash}`);
        });
    }
    catch(error) {
        alert(error.message);
    }
}

async function collect() {
    console.log("Collect rewards");
    try {
        await sapphiremineContract.methods.sellSapphires().send({
            from: selectedAccount
        }).then((txHash) => {
            alert(`Transaction complete: https://etherscan.io/tx/${txHash.transactionHash}`);
        });
    }
    catch(error) {
        alert(error.message);
    }
}

function getValues() {
    let amount = document.querySelector('#input-matic').value;
    return amount;
}

window.addEventListener('load', async () => {
    init_wallet();
    onConnect();
    document.querySelector("#btn-connect").addEventListener("click", onConnect);
    document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
    document.querySelector("#hire-miners").addEventListener("click", hireMiners);
    document.querySelector("#rehire-miners").addEventListener("click", rehireMiners);
    document.querySelector("#collect").addEventListener("click", collect);
});