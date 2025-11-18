# Design: HTTP Method Selection for Manual x402 URL Flow

## 1. Overview
Enhance the manual x402 URL entry flow by allowing users to select either GET or POST as the HTTP method when initiating a request. If the server response status is not 402, display an English prompt advising the user to retry with the other method.

## 2. UI Changes
File: `src/app/views/x402URL.tsx`

1. Add a method selector next to the URL input:
   - Use a `<select>` (or radio buttons) with options "GET" and "POST".
   - Manage the selection via React state (`method`, default `"POST"`).

2. Update the fetch invocation to use the selected method:
   ```ts
   const response = await fetch(url, {
     method,
     headers: { "Content-Type": "application/json" }
   })
   ```

## 3. Error Handling
After receiving the response:
- If `response.status === 402`: continue with existing logic.
- Else:
  - Set the component's `error` state to:
    > Request did not return a 402 status. Please try again using GET or POST.
  - Keep the drawer open to allow retry with a different method.

## 4. State Management
- Introduce:
  ```ts
  const [method, setMethod] = useState<"GET" | "POST">("POST")
  ```
- Bind `<select>` or radio inputs to `method` and `setMethod`.
- Include `method` in the confirmation handler.

## 5. Testing
- Verify the selector appears and defaults to POST.
- Test with an endpoint that returns non-402: confirm the English error message.
- Test with a valid 402 endpoint using both GET and POST to ensure existing flow continues.
