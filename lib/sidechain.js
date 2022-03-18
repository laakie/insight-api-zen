var Common = require('./common');

function SidechainController(node) {
    this.node = node;

    this.common = new Common({log: this.node.log});
}

SidechainController.MAXIMUM_SIDECHAIN_SIZE = 10;
SidechainController.DEFAULT_SIDECHAIN_CACHE_SIZE = 50;

SidechainController.prototype.list = function(req, res) {
    var self = this;

    var onlyAlive = req.query.onlyAlive ? req.query.onlyAlive : 0;
    var from = parseInt(req.query.from) ? parseInt(req.query.from) : 0;
    var to = parseInt(req.query.to) ? parseInt(req.query.to) : SidechainController.MAXIMUM_SIDECHAIN_SIZE;
    if (to-from > SidechainController.MAXIMUM_SIDECHAIN_SIZE) {
        to = from + SidechainController.MAXIMUM_SIDECHAIN_SIZE;
    }

    this.getScInfo("*", {onlyAlive: onlyAlive, from: from, to: to}, function(err, data) {
        if(err) {
            return self.common.handleErrors(err, res);
        }
        var result = {
            totalItems: data.length,
            from: from,
            to: to,
            items: data.map(sc => self.transformSidechain(sc))
        }
        res.jsonp(result);
    });
};

SidechainController.prototype.sidechain = function(req, res) {
    var self = this;

    this.getScInfo(req.params.scid, {}, function(err, data) {
        if(err) {
            return self.common.handleErrors(err, res);
        }
        var transformedSidechain = self.transformSidechain(data[0]);
        res.jsonp(transformedSidechain);
    });
};

SidechainController.prototype.getScInfo = function(scid, options, callback) {
    this.node.getScInfo(scid, options,function(err, scinfos) {
        if(err) {
            return callback(err);
        }
        callback(null, scinfos);
    });
}


SidechainController.prototype.transformSidechain = function (sc) {
    if (sc) {
        return {
            scid: sc.scid,
            balance: sc.balance,
            withdrawalEpochLength: sc.withdrawalEpochLength,
            state: sc.state,
            creatingTxHash: sc.creatingTxHash,
            createdAtBlockHeight: sc.createdAtBlockHeight,
            lastCertificateEpoch:  sc.lastCertificateEpoch,
            lastCertificateHash: sc.lastCertificateHash,
            lastCertificateQuality: sc.lastCertificateQuality,
            lastCertificateAmount: sc.lastCertificateAmount,
            immatureAmounts: sc.immatureAmounts,
            ceasingHeight: sc.ceasingHeight,
            endEpochHeight: sc.endEpochHeight,
            version: sc.sidechainVersion,
            wCertVk: sc.wCertVk,
            constant: sc.constant
        }
    }
    else {
        return "Sidechain ID not found!"
    }
}

module.exports = SidechainController;