KeyDetails = function(parentEl, displayCompressed) {

    var self = this;

    var template = $("#key-details").html();
    var el = $(template);
    parentEl.append(el);

    var DOM = {};
    DOM.address = el.find(".address");
    DOM.pubkey = el.find(".public-key");
    DOM.privkey = el.find(".private-key");
    DOM.bip38privkey = el.find(".bip38-private-key");
    DOM.bip38password = $(".supplied-password");

    this.setPrivateKey = function(originalKey) {
        var o = { compressed: displayCompressed };
        var displayKey = new bitcoinjs.bitcoin.ECPair(originalKey.d, null, o);
        display(displayKey);
    }

    this.setPublicKey = function(originalKey) {
        var o = { compressed: displayCompressed };
        var displayKey = new bitcoinjs.bitcoin.ECPair(null, originalKey.__Q, o);
        display(displayKey);
    }

    function display(displayKey) {
        self.clear()
        // show address
        DOM.address.val(displayKey.getAddress());
        // show public key hex
        DOM.pubkey.val(displayKey.getPublicKeyBuffer().toString("hex"));
        // if it has private key details
        if (displayKey.d) {
            // show private key wif
            DOM.privkey.val(displayKey.toWIF());
            // show BIP38 key
            var bip38password = DOM.bip38password.val();
            if (bip38password != "") {
                var bip38privkey = bitcoinjsBip38.encrypt(displayKey.d.toBuffer(), displayKey.compressed, bip38password);
                DOM.bip38privkey.val(bip38privkey);
            }
        }
    }

    this.clear = function() {
        DOM.address.val("");
        DOM.pubkey.val("");
        DOM.privkey.val("");
        DOM.bip38privkey.val("");
    }
}
