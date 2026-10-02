export const openApiSpecification = {
  openapi: "3.0.3",
  info: {
    title: "CLINITIAL AI Healthcare Platform API",
    version: "2.0.0",
    description: "Production-grade, HIPAA, NABH, FHIR R4 and ABDM-ready healthcare backend API."
  },
  servers: [{ url: "/api", description: "CLINITIAL Core Production Gateway" }],
  paths: {
    "/v1/auth/login": {
      post: {
        summary: "Universal Authenticated Login",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } } } } },
        responses: { "200": { description: "Session token issued" }, "401": { description: "Invalid credentials" } }
      }
    },
    "/v1/patients": {
      get: { summary: "List Patients", responses: { "200": { description: "Patients list" } } },
      post: { summary: "Create Patient Record", responses: { "201": { description: "Patient created" } } }
    },
    "/v1/subscription/verify-payment": {
      post: { summary: "Verify Cryptographic Razorpay Payment", responses: { "200": { description: "Payment verified" }, "400": { description: "Signature mismatch" } } }
    },
    "/gemini/prescription-assist": {
      post: { summary: "Clinical Decision Support Prescription Copilot", responses: { "200": { description: "AI suggestions with safety alerts" } } }
    }
  }
};
