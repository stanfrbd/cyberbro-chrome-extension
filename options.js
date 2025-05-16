document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.getElementById("cyberbro-url");
    const apiPrefixInput = document.getElementById("api-prefix");
    const form = document.getElementById("options-form");
    const status = document.getElementById("status");

    // Load existing options
    chrome.storage.sync.get(["cyberbroUrl", "apiPrefix", "selectedEngines"], (data) => {
        if (data.cyberbroUrl) urlInput.value = data.cyberbroUrl;
        if (data.apiPrefix) apiPrefixInput.value = data.apiPrefix;

        if (data.selectedEngines) {
            data.selectedEngines.forEach((engine) => {
                const checkbox = document.getElementById(engine);
                if (checkbox) checkbox.checked = true;
            });
        }
    });

    // Save options
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const selectedEngines = Array.from(
            document.querySelectorAll("input[type=checkbox]:checked")
        ).map((checkbox) => checkbox.value);

        chrome.storage.sync.set(
            { cyberbroUrl: urlInput.value, apiPrefix: apiPrefixInput.value, selectedEngines },
            () => {
                status.textContent = "Options saved.";
                setTimeout(() => (status.textContent = ""), 3000);
            }
        );
    });
});

document.addEventListener('DOMContentLoaded', function () {

    function selectAllEngines() {
        document.querySelectorAll('#engine-options input[type="checkbox"]').forEach(checkbox => checkbox.checked = true);
    }

    function selectAbuseChecker() {
        document.querySelectorAll('#engine-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = checkbox.dataset.supports.includes('abuse');
        });
    }

    function selectHash() {
        document.querySelectorAll('#engine-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = checkbox.dataset.supports.includes('hash');
        });
    }

    function selectVpn() {
        document.querySelectorAll('#engine-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = checkbox.dataset.supports.includes('vpn');
        });
    }

    function selectDefault() {
        document.querySelectorAll('#engine-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = checkbox.dataset.supports.includes('default');
        });
    }

    function selectFree() {
        document.querySelectorAll('#engine-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = checkbox.dataset.supports.includes('free');
        });
    }

    function selectExtension() {
        document.querySelectorAll('#engine-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = checkbox.dataset.supports.includes('extension');
        });
    }


    document.querySelector('label[for="selectAll"]').addEventListener('click', selectAllEngines);

    document.querySelector('label[for="selectAbuseChecker"]').addEventListener('click', selectAbuseChecker);

    document.querySelector('label[for="selectHash"]').addEventListener('click', selectHash);

    document.querySelector('label[for="selectVpn"]').addEventListener('click', selectVpn);

    document.querySelector('label[for="selectFree"]').addEventListener('click', selectFree);

    document.querySelector('label[for="selectExtension"]').addEventListener('click', selectExtension);

    document.querySelector('label[for="selectDefault"]').addEventListener('click', selectDefault);

});