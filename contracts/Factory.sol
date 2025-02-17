// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import {Token} from "./Token.sol";

contract Factory {
    uint256 public constant TARGET = 3 ether;
    uint256 public constant TOKEN_LIMIT = 500_000 ether;
    //交易费费用
    uint256 public immutable fee;
    //合约的部署者
    address public owner;
    //token数组
    address[] public tokens;
    //token总共的数量
    uint256 public totalTokens;

    //将token的地址映射到token售卖信息的结构体上
    mapping(address => TokenSale) public tokenToSale;
    //创建一个售卖token的结构体
    struct TokenSale{
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }
    //当创建一个token时，发生了一个Created事件
    event Created(address indexed token);
    //当购买一个token时，发生一个Buy事件
    event Buy(address indexed token, uint256 amount);

    constructor(uint256 _fee) {
        fee = _fee;
        owner = msg.sender;
    }

    //通过token在token数组中的下标_index，来获取token的售卖信息
    function getTokenSale(uint256 _index) public view returns (TokenSale memory) {
        return tokenToSale[tokens[_index]];
    }

    function getCost(uint256 _sold) public pure returns (uint256){
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether;
        uint256 increment = 10000 ether;
        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;
    }

    function create(string memory _name, string memory _symbol) external payable {
        //确保创建者的余额大于fee，否则报错不向下继续执行。
        require(msg.value >= fee, "Factory: Creator fee not met");
        
        //创建一个token
        Token token = new Token(msg.sender, _name, _symbol, 1000000 ether);
        //tokens数组存储token
        tokens.push(address(token));
        //token计数
        totalTokens ++;
        //列出用于售卖的token
        // address token;
        // string name;
        // address creator;
        // uint256 sold;
        // uint256 raised;
        // bool isOpen;
        TokenSale memory sale = TokenSale(address(token),_name,msg.sender,0,0,true);

        tokenToSale[address(token)] = sale;
        //触发Created事件，通知token被创建了。
        emit Created(address(token));
    }

    function buy(address _token, uint256 _amount) external payable{
        TokenSale storage sale = tokenToSale[_token];
        //检查条件
        require(sale.isOpen == true, "Factory: Buying closed");
        require(_amount >= 1 ether, "Factory: Amount too low");
        require(_amount <= 10000 ether, "Factory: Amount exceeded");

        //计算一个token的价格基于购买的总量
        uint256 cost = getCost(sale.sold);
        uint256 price = cost * (_amount / 10 ** 18);
        //确保足够的ETH发送
        require(msg.value >= price, "Factory: Insufficient ETH received");
        //更新sale
        sale.sold += _amount;
        sale.raised += price;
        //判断筹集目标是否达成
        if(sale.sold >= TOKEN_LIMIT || sale.raised >= TARGET){
            //关闭销售
            sale.isOpen = false;
        }

        Token(_token).transfer(msg.sender, _amount);
        //触发Buy事件
        emit Buy(_token, _amount);
    }

    function deposit(address _token) external{
        //代币销售结束后资金结算的逻辑

        //剩下的token余额和增加的ETH
        //会进入像uniswap v3那样的流动性池
        //为了简单起见，我们只转移剩余的部分
        //剩余的tokens 和 ETH转给creator
        Token token = Token(_token);
        TokenSale memory sale = tokenToSale[_token];

        require(sale.isOpen == false,"Factory: Target not reached");

        //将Factory合约持有的代币转移给creator
        token.transfer(sale.creator, token.balanceOf(address(this)));

        //将筹集的ETH全部转移creator
        (bool success,) = payable(sale.creator).call{value: sale.raised}("");
        require(success,"Factory: ETH transfer failed");

    }

    function withdraw(uint256 _amount) external{
        require(msg.sender == owner, "Factory: Not Owner");
        
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Factory: ETH transfer failed");

    }

}