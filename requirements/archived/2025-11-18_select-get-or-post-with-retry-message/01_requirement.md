# Requirement

Currently, when users manually enter an x402 URL to initiate a request, the HTTP method is hard-coded to POST. We need to allow users to choose between GET and POST.

After sending the request, if the response status is not `402`, display an English error message prompting the user to retry with the other HTTP method, for example:
"Request did not return a 402 status. Please try again using GET or POST."
