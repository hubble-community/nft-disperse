// SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTDisperse {
    function disperse(address nftContract, uint[] calldata tokenIds, address[] calldata recipients) external {
        require(tokenIds.length == recipients.length, "Invalid input");
        for (uint i = 0; i < tokenIds.length; i++) {
            IERC721(nftContract).transferFrom(msg.sender, recipients[i], tokenIds[i]);
        }
    }
}
