# Requirement

After connecting the wallet, the extension reads the current address from the wallet plugin. However, if the user switches the selected address in the wallet plugin afterwards, the extension does not update to reflect the new address.

We need to enhance the extension so that once the wallet is connected, it listens for address changes in the wallet plugin and automatically synchronizes the displayed address in the extension.
