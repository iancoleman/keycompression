(function() {

    var DOM = {};
    DOM.suppliedKey = $(".supplied-key");
    DOM.suppliedPassword = $(".supplied-password");
    DOM.suppliedType = $(".supplied-type");
    DOM.compressed = $(".compressed");
    DOM.uncompressed = $(".uncompressed");

    var compressedDetails = new KeyDetails(DOM.compressed, true);
    var uncompressedDetails = new KeyDetails(DOM.uncompressed, false);

    function init() {
        setEvents();
    }

    function setEvents() {
        DOM.suppliedKey.on("input", readSuppliedKey);
        DOM.suppliedPassword.on("input", delayedReadSuppliedKey);
        DOM.suppliedKey.focus();
    }

    var delayedReadSuppliedKeyTimeoutEvent = null;
    function delayedReadSuppliedKey() {
        if (delayedReadSuppliedKeyTimeoutEvent != null) {
            clearTimeout(delayedReadSuppliedKeyTimeoutEvent);
        }
        delayedReadSuppliedKeyTimeoutEvent = setTimeout(readSuppliedKey, 500);
    }

    function readSuppliedKey() {
        var suppliedKey = DOM.suppliedKey.val();
        var suppliedPassword = DOM.suppliedPassword.val();
        var keypair = null;
        // try privkey
        try {
            keypair = bitcoinjs.bitcoin.ECPair.fromWIF(suppliedKey);
            var compType = keypair.compressed ? "compressed" : "uncompressed";
            var typeStr = "a " + compType + " private key";
            DOM.suppliedType.text(typeStr);
            // display the details
            compressedDetails.setPrivateKey(keypair);
            uncompressedDetails.setPrivateKey(keypair);
        } catch (e) {}
        // try pubkey
        try {
            if (keypair == null) {
                var hex = suppliedKey.replace(/^0x/, "");
                var b = bitcoinjs.Buffer.Buffer.from(hex, "hex");
                keypair = bitcoinjs.bitcoin.ECPair.fromPublicKeyBuffer(b);
                var compType = keypair.compressed ? "compressed" : "uncompressed";
                var typeStr = "a " + compType + " public key";
                DOM.suppliedType.text(typeStr);
                // display the details
                compressedDetails.setPublicKey(keypair);
                uncompressedDetails.setPublicKey(keypair);
            }
        } catch (e) {}
        // try BIP38 key
        try {
            if (keypair == null) {
                var decrypted = bitcoinjsBip38.decrypt(suppliedKey, suppliedPassword, updateBip38Progress);
                var wif = bitcoinjsWif.encode(0x80, decrypted.privateKey, decrypted.compressed);
                keypair = bitcoinjs.bitcoin.ECPair.fromWIF(wif);
                var compType = keypair.compressed ? "compressed" : "uncompressed";
                var typeStr = "a BIP38 encrypted " + compType + " private key";
                DOM.suppliedType.text(typeStr);
                // display the details
                compressedDetails.setPrivateKey(keypair);
                uncompressedDetails.setPrivateKey(keypair);
            }
        } catch (e) {}
        // display the type
        if (keypair == null) {
            DOM.suppliedType.text("not a bitcoin key");
            compressedDetails.clear();
            uncompressedDetails.clear();
            return;
        }
    }

    function updateBip38Progress(p) {
        DOM.suppliedType.text("Decrypting key: " + p.percent + "%");
    }

    init();

})()
