/// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "@relicprotocol/contracts/lib/FactSigs.sol";
import "@relicprotocol/contracts/interfaces/IReliquary.sol";

contract Token is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    IReliquary public immutable reliquary;

    constructor(address _reliquary) ERC721("My Birth Relic", "MBR") Ownable() {
        reliquary = IReliquary(_reliquary);
    }

    function mint(address who) public returns (uint256) {
        (bool exist, , bytes memory data) = reliquary.verifyFactNoFee(
            who,
            FactSigs.birthCertificateFactSig()
        );

        require(exist, "birth certificate fact missing");

        uint48 blockNum = uint48(bytes6(data));

        require(blockNum < block.number - 1000000, "account too new");

        uint256 tokenId = _tokenIds.current();

        _mint(who, tokenId);

        _tokenIds.increment();

        return tokenId;
    }
}
