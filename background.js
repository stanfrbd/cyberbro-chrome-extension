chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
    chrome.contextMenus.create({
        id: "analyzeWithCyberbro",
        title: "Analyze with Cyberbro",
        contexts: ["selection"]
    });
    console.log("Context menu item created");
});

chrome.contextMenus.onClicked.addListener(async (info) => {
    console.log("Context menu item clicked", info);
    if (info.menuItemId === "analyzeWithCyberbro") {
        const selectedText = info.selectionText;
        console.log("Selected text:", selectedText);

        // Retrieve settings (Cyberbro URL, API prefix, and selected engines)
        chrome.storage.sync.get(["cyberbroUrl", "apiPrefix", "selectedEngines"], async (data) => {
            const cyberbroUrl = data.cyberbroUrl || "http://127.0.0.1:5000";
            const apiPrefix = data.apiPrefix || "/api";
            const engines = data.selectedEngines || [];
            console.log("Cyberbro URL:", cyberbroUrl);
            console.log("API Prefix:", apiPrefix);
            console.log("Selected engines:", engines);

            if (!engines.length) {
                console.error("Please configure the engines in the options.");
                return;
            }

            try {
                // Send the selected content for analysis
                console.log("Sending selected text for analysis");
                const response = await fetch(`${cyberbroUrl}${apiPrefix}/analyze`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*" // Added CORS header
                    },
                    body: JSON.stringify({ text: selectedText, engines: engines })
                });

                // log the response
                console.log(response);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseText = await response.text();
                let jsonResponse;
                try {
                    jsonResponse = JSON.parse(responseText);
                } catch (e) {
                    throw new Error("Invalid JSON response");
                }

                const { analysis_id, link } = jsonResponse;
                console.log("Analysis request ID:", analysis_id);
                console.log("Results link:", link);

                // Show a simple toast notification while analysis is in progress
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs.length > 0) {
                        const tab = tabs[0];
                        const tabId = tab.id;
                        const url = tab.url;
                        if (url && !url.startsWith('chrome://') && !url.startsWith('edge://')) {
                            chrome.scripting.executeScript({
                                target: { tabId: tabId },
                                func: () => {
                                    var toast = document.createElement('div');
                                    toast.innerText = 'Cyberbro is analyzing the selected text...';
                                    toast.style.position = 'fixed';
                                    toast.style.bottom = '20px';
                                    toast.style.left = '50%';
                                    toast.style.transform = 'translateX(-50%)';
                                    toast.style.backgroundColor = 'black';
                                    toast.style.color = 'white';
                                    toast.style.padding = '10px';
                                    toast.style.borderRadius = '5px';
                                    toast.style.zIndex = '10000';
                                    document.body.appendChild(toast);
                                    setTimeout(() => toast.remove(), 3000);
                                }
                            });
                        } else {
                            console.error("Cannot execute script on chrome:// or edge:// URLs");
                        }
                    } else {
                        console.error("No active tab found");
                    }
                });

                // Check if the analysis is complete
                const checkStatus = async () => {
                    console.log("Checking analysis status for ID:", analysis_id);
                    const statusResponse = await fetch(`${cyberbroUrl}${apiPrefix}/is_analysis_complete/${analysis_id}`, {
                        method: "GET",
                        headers: {
                            "Access-Control-Allow-Origin": "*" // Added CORS header
                        }
                    });
                    const statusText = await statusResponse.text();
                    let statusJson;
                    try {
                        statusJson = JSON.parse(statusText);
                    } catch (e) {
                        throw new Error("Invalid JSON response");
                    }
                    const { complete } = statusJson;
                    console.log("Analysis complete:", complete);

                    if (complete) {
                        chrome.tabs.create({ url: `${cyberbroUrl}/results/${analysis_id}` });
                        console.log("Analysis complete, opening results tab");
                    } else {
                        setTimeout(checkStatus, 1000); // Retry in 1 seconds
                        console.log("Analysis not complete, retrying in 1 seconds");
                    }
                };

                checkStatus();
            } catch (error) {
                console.error("Error sending data:", error.message);
            }
        });
    }
});
