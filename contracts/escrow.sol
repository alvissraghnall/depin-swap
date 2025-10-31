// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleEscrow {

    enum TradeStatus { 
        PENDING,        
        ACTIVE,         
        COMPLETED,      
        CANCELLED       
    }

    struct Trade {
        uint256 tradeId;
        address payable buyer;
        address payable seller;
        uint256 price;
        TradeStatus status;
        bool sellerConfirmed;
        bool buyerConfirmed;
    }

    uint256 public tradeCounter;
    mapping(uint256 => Trade) public trades;

    event TradeCreated(uint256 indexed tradeId, address indexed buyer, address indexed seller, uint256 price);
    event SellerConfirmed(uint256 indexed tradeId);
    event FulfillmentConfirmed(uint256 indexed tradeId, address indexed seller, uint256 amount);
    event TradeCancelled(uint256 indexed tradeId);

    modifier onlyBuyer(uint256 _tradeId) {
        require(msg.sender == trades[_tradeId].buyer, "Only buyer can call this");
        _;
    }

    modifier onlySeller(uint256 _tradeId) {
        require(msg.sender == trades[_tradeId].seller, "Only seller can call this");
        _;
    }

    modifier tradeExists(uint256 _tradeId) {
        require(_tradeId < tradeCounter, "Trade does not exist");
        _;
    }

    function createTrade(address payable _seller, uint256 _price) 
        external 
        payable 
        returns (uint256) 
    {
        require(_seller != address(0), "Invalid seller address");
        require(_seller != msg.sender, "Buyer and seller cannot be the same");
        require(_price > 0, "Price must be greater than 0");
        require(msg.value == _price, "Must send exact price amount");

        uint256 newTradeId = tradeCounter;

        trades[newTradeId] = Trade({
            tradeId: newTradeId,
            buyer: payable(msg.sender),
            seller: _seller,
            price: _price,
            status: TradeStatus.PENDING,
            sellerConfirmed: false,
            buyerConfirmed: true  
        });

        tradeCounter++;

        emit TradeCreated(newTradeId, msg.sender, _seller, _price);

        return newTradeId;
    }

    function sellerAcceptTrade(uint256 _tradeId) 
        external 
        tradeExists(_tradeId)
        onlySeller(_tradeId) 
    {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.PENDING, "Trade is not in pending status");
        require(!trade.sellerConfirmed, "Seller already confirmed");

        trade.sellerConfirmed = true;
        trade.status = TradeStatus.ACTIVE;

        emit SellerConfirmed(_tradeId);
    }

    function confirmFulfillment(uint256 _tradeId) 
        external 
        tradeExists(_tradeId)
        onlyBuyer(_tradeId) 
    {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.ACTIVE, "Trade is not active");
        require(trade.sellerConfirmed, "Seller has not accepted trade");

        trade.status = TradeStatus.COMPLETED;

        uint256 amount = trade.price;
        trade.seller.transfer(amount);

        emit FulfillmentConfirmed(_tradeId, trade.seller, amount);
    }

    function cancelTrade(uint256 _tradeId) 
        external 
        tradeExists(_tradeId)
        onlyBuyer(_tradeId) 
    {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.PENDING, "Can only cancel pending trades");
        require(!trade.sellerConfirmed, "Cannot cancel after seller confirmed");

        trade.status = TradeStatus.CANCELLED;

        uint256 refundAmount = trade.price;
        trade.buyer.transfer(refundAmount);

        emit TradeCancelled(_tradeId);
    }

    function getTrade(uint256 _tradeId) 
        external 
        view 
        tradeExists(_tradeId)
        returns (Trade memory) 
    {
        return trades[_tradeId];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
