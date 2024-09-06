
frontend code to fetch webhook

```

  // webhook data
useEffect(() => {
        // Polling the backend for the latest webhook data every 5 seconds
        const interval = setInterval(() => {
            fetchdata("/api/webhooks/latest", {
                method: "GET",
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch webhook data");
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Fetched webhook data:", data);
                    setWebhookData(data);
                })
                .catch((error) => {
                    console.error("Error:", error);
                    setError("Failed to fetch webhook data");
                });
        }, 5000); // Poll every 5 seconds

        // Cleanup the interval on component unmount
        return () => clearInterval(interval);
    }, []);
```
