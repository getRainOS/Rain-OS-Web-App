ratelimit-lite

ratelimit-lite is a small library for adding rate limiting to your Node app. It's pretty flexible and should work for most use cases. You can use it with Express or other frameworks if you set it up right.

To get started install it and then add it to your app. There are some options you can pass in to change how it works, like how many requests are allowed and the time window. It uses memory by default but you can plug in Redis if you need it to work across multiple servers.

If a client goes over the limit they get an error back. You might want to customize this. Check the source code for more details on the options available, and feel free to open an issue if something doesn't work.
