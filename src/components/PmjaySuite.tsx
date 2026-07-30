import React, { useState } from "react";
import { 
  ShieldCheck, 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  FileText, 
  Code2, 
  Download, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Layers, 
  Server, 
  Building2, 
  Clock, 
  Search,
  KeyRound,
  FileCheck2,
  Printer
} from "lucide-react";

interface PmjaySuiteProps {
  onClose?: () => void;
}

export const PmjaySuite: React.FC<PmjaySuiteProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<"playground" | "docs" | "snippets" | "lookup">("playground");
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "json" | "xml">("pdf");
  const [selectedPreset, setSelectedPreset] = useState<string>("default_pdf");
  
  // Request JSON State
  const [requestBodyJson, setRequestBodyJson] = useState<string>(() => JSON.stringify({
    txnId: "f7f1469c-29b0-4325-9dfc-c567200a70f7",
    format: "pdf",
    certificateParameters: {
      UDF1: "PMJAY0000",
      UDF2: ""
    },
    consentArtifact: {
      consent: {
        consentId: "ea9c43aa-7f5a-4bf3-a0be-e1caa24737ba",
        timestamp: "2026-07-30T10:40:35.838Z",
        dataConsumer: {
          id: "string"
        },
        dataProvider: {
          id: "string"
        },
        purpose: {
          description: "Verification of Ayushman Bharat PM-JAY e-Card"
        },
        user: {
          idType: "AADHAAR",
          idNumber: "XXXXXXXX1234",
          mobile: "9876543210",
          email: "beneficiary@pmjay.gov.in"
        },
        data: {
          id: "PMJAY0000"
        },
        permission: {
          access: "VIEW",
          dateRange: {
            from: "2026-07-30T10:40:35.838Z",
            to: "2026-07-30T10:40:35.839Z"
          },
          frequency: {
            unit: "ONCE",
            value: 1,
            repeats: 0
          }
        }
      },
      signature: {
        signature: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImFwaXNldHUtcG1qYXkifQ"
      }
    }
  }, null, 2));

  // Custom Authorization Header state
  const [apiKey, setApiKey] = useState<string>("APISETU_BEARER_KEY_DEMO_2026");
  const [clientSecret, setClientSecret] = useState<string>("pmjay_sec_live_99812");

  // API Execution States
  const [loading, setLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string> | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"curl" | "javascript" | "python" | "node" | "java">("javascript");

  // Quick Beneficiary Lookup State
  const [searchPmjayId, setSearchPmjayId] = useState<string>("PMJAY0000");

  // Presets definition
  const handleSelectPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    let newPayload: any = {};
    if (presetKey === "default_pdf") {
      setSelectedFormat("pdf");
      newPayload = {
        txnId: `f7f1469c-${Math.floor(1000 + Math.random() * 9000)}-4325-9dfc-c567200a70f7`,
        format: "pdf",
        certificateParameters: { UDF1: "PMJAY0000", UDF2: "" },
        consentArtifact: {
          consent: {
            consentId: `ea9c43aa-${Math.floor(1000 + Math.random() * 9000)}-4bf3-a0be-e1caa24737ba`,
            timestamp: new Date().toISOString(),
            dataConsumer: { id: "CURA_HEALTHCARE_HQ" },
            dataProvider: { id: "NHA_DELHI_PMJAY" },
            purpose: { description: "Hospital Admission & Scheme Verification" },
            user: { idType: "AADHAAR", idNumber: "XXXXXXXX1234", mobile: "9876543210", email: "beneficiary@pmjay.gov.in" },
            data: { id: "PMJAY0000" },
            permission: { access: "VIEW", dateRange: { from: new Date().toISOString(), to: new Date().toISOString() }, frequency: { unit: "ONCE", value: 1, repeats: 0 } }
          },
          signature: { signature: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImFwaXNldHUtcG1qYXkifQ" }
        }
      };
    } else if (presetKey === "valid_json") {
      setSelectedFormat("json");
      newPayload = {
        txnId: `json-${Date.now()}-txn`,
        format: "json",
        certificateParameters: { UDF1: "PMJAY884920", UDF2: "DELHI" },
        consentArtifact: {
          consent: {
            consentId: `cons-${Date.now()}`,
            timestamp: new Date().toISOString(),
            dataConsumer: { id: "CURA_DELHI_EMERGENCY" },
            dataProvider: { id: "NHA_PMJAY_ISSUER" },
            purpose: { description: "e-Card JSON Attributes Verification" },
            user: { idType: "PMJAY_ID", idNumber: "PMJAY884920", mobile: "9988776655", email: "sharma.sita@pmjay.gov.in" },
            data: { id: "PMJAY884920" },
            permission: { access: "VIEW", dateRange: { from: new Date().toISOString(), to: new Date().toISOString() }, frequency: { unit: "ONCE", value: 1, repeats: 0 } }
          },
          signature: { signature: "sig_verified_pmjay_json" }
        }
      };
    } else if (presetKey === "valid_xml") {
      setSelectedFormat("xml");
      newPayload = {
        txnId: `xml-${Date.now()}-txn`,
        format: "xml",
        certificateParameters: { UDF1: "PMJAY102938", UDF2: "" },
        consentArtifact: {
          consent: {
            consentId: `cons-xml-${Date.now()}`,
            timestamp: new Date().toISOString(),
            dataConsumer: { id: "CURA_EHR_INTEGRATION" },
            dataProvider: { id: "NHA_PMJAY_ISSUER" },
            purpose: { description: "DigiLocker XML Certificate Fetch" },
            user: { idType: "AADHAAR", idNumber: "XXXXXXXX8899", mobile: "9123456789", email: "verma.ananya@pmjay.gov.in" },
            data: { id: "PMJAY102938" },
            permission: { access: "VIEW", dateRange: { from: new Date().toISOString(), to: new Date().toISOString() }, frequency: { unit: "ONCE", value: 1, repeats: 0 } }
          },
          signature: { signature: "sig_xml_verified" }
        }
      };
    } else if (presetKey === "err_400_missing_param") {
      newPayload = {
        txnId: "f7f1469c-29b0-4325-9dfc-c567200a70f7",
        format: "pdf",
        certificateParameters: { UDF1: "", UDF2: "" } // Missing required UDF1
      };
    } else if (presetKey === "err_401_unauthorized") {
      newPayload = {
        txnId: "unauth-txn-1234",
        format: "pdf",
        certificateParameters: { UDF1: "PMJAY0000", UDF2: "" },
        consentArtifact: { consent: { user: { idType: "INVALID" } } }
      };
    } else if (presetKey === "err_404_not_found") {
      newPayload = {
        txnId: "notfound-txn-9999",
        format: "pdf",
        certificateParameters: { UDF1: "PMJAY_NON_EXISTENT_999999", UDF2: "" },
        consentArtifact: {
          consent: {
            consentId: "ea9c43aa-7f5a-4bf3-a0be-e1caa24737ba",
            timestamp: new Date().toISOString(),
            dataConsumer: { id: "string" },
            dataProvider: { id: "string" },
            purpose: { description: "string" },
            user: { idType: "PMJAY_ID", idNumber: "PMJAY_NON_EXISTENT_999999", mobile: "0000000000", email: "test@test.com" },
            data: { id: "PMJAY_NON_EXISTENT_999999" },
            permission: { access: "string", dateRange: { from: new Date().toISOString(), to: new Date().toISOString() }, frequency: { unit: "string", value: 0, repeats: 0 } }
          },
          signature: { signature: "string" }
        }
      };
    }
    setRequestBodyJson(JSON.stringify(newPayload, null, 2));
  };

  // Execute API Request
  const handleExecuteApiCall = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseData(null);
    setResponseHeaders(null);
    const startTime = performance.now();

    try {
      let parsedBody: any = {};
      try {
        parsedBody = JSON.parse(requestBodyJson);
      } catch (e: any) {
        setLoading(false);
        setResponseStatus(400);
        setResponseData({ error: "invalid_json_format", errorDescription: "Your request body contains invalid JSON syntax." });
        setExecutionTimeMs(0);
        return;
      }

      const res = await fetch("/api/v1/pmjay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-APIKey": apiKey,
          "X-Client-Secret": clientSecret
        },
        body: JSON.stringify(parsedBody)
      });

      const endTime = performance.now();
      setExecutionTimeMs(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      // Construct header response object
      const resHeaderObj: Record<string, string> = {
        "content-type": res.headers.get("content-type") || "application/json",
        "x-apisetu-provider": "National Health Authority (NHA) Delhi",
        "x-apisetu-version": "3.0.0",
        "x-rate-limit-remaining": "998/1000",
        "x-request-id": parsedBody.txnId || `req-${Date.now()}`
      };
      setResponseHeaders(resHeaderObj);

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await res.json();
        setResponseData(json);
      } else {
        const text = await res.text();
        setResponseData(text);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setExecutionTimeMs(Math.round(endTime - startTime));
      setResponseStatus(500);
      setResponseData({
        error: "internal_server_error",
        errorDescription: err.message || "Failed to execute POST request to /pmjay"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCodeSnippet = () => {
    const endpoint = "https://apisetu.gov.in/certificate/v3/pmjay";
    if (selectedLanguage === "curl") {
      return `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-APIKey: ${apiKey}" \\
  -H "X-Client-Secret: ${clientSecret}" \\
  -d '${requestBodyJson.replace(/'/g, "\\'")}'`;
    }

    if (selectedLanguage === "javascript") {
      return `// JavaScript / Browser Fetch API
const fetchPmjayCertificate = async () => {
  const response = await fetch("${endpoint}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-APIKey": "${apiKey}",
      "X-Client-Secret": "${clientSecret}"
    },
    body: JSON.stringify(${requestBodyJson})
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("API Setu PM-JAY Error:", errorData);
    return;
  }

  const result = await response.json();
  console.log("Ayushman Bharat e-Card Response:", result);
};`;
    }

    if (selectedLanguage === "python") {
      return `# Python requests library
import requests
import json

url = "${endpoint}"
headers = {
    "Content-Type": "application/json",
    "X-APIKey": "${apiKey}",
    "X-Client-Secret": "${clientSecret}"
}
payload = ${requestBodyJson}

response = requests.post(url, headers=headers, json=payload)
print("Status Code:", response.status_code)
print("Response Body:", response.text)`;
    }

    if (selectedLanguage === "node") {
      return `// Node.js (axios)
const axios = require('axios');

async function verifyPmjayECard() {
  try {
    const response = await axios.post(
      '${endpoint}',
      ${requestBodyJson},
      {
        headers: {
          'Content-Type': 'application/json',
          'X-APIKey': '${apiKey}',
          'X-Client-Secret': '${clientSecret}'
        }
      }
    );
    console.log('PM-JAY Certificate Data:', response.data);
  } catch (error) {
    console.error('PM-JAY Verification Failed:', error.response ? error.response.data : error.message);
  }
}

verifyPmjayECard();`;
    }

    if (selectedLanguage === "java") {
      return `// Java 11 HttpClient
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class PmjayVerificationService {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String jsonPayload = """
${requestBodyJson}
""";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${endpoint}"))
            .header("Content-Type", "application/json")
            .header("X-APIKey", "${apiKey}")
            .header("X-Client-Secret", "${clientSecret}")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Status Code: " + response.statusCode());
        System.out.println("Response: " + response.body());
    }
}`;
    }

    return "";
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 font-sans p-4 md:p-6 space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-orange-950/80 via-slate-900 to-emerald-950/80 border border-orange-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
              API Setu Gateway • NHA Delhi
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full font-mono">
              OAS 3.0 • v3.0.0
            </span>
            <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Building2 className="h-3 w-3 text-emerald-400" /> DigiLocker Partner
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Pradhan Mantri Jan Arogya Yojana (PM-JAY)
          </h1>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
            Ayushman Bharat PM-JAY e-cards are now available on DigiLocker. Beneficiaries and empanelled healthcare providers can verify PMJAY e-cards in real-time under the issued document section via API Setu.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-800 transition-all cursor-pointer shrink-0"
          >
            ✕ Close Tester
          </button>
        )}
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("playground")}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "playground"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/20"
              : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Play className="h-4 w-4" /> API Tester Playground
        </button>

        <button
          onClick={() => setActiveTab("snippets")}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "snippets"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/20"
              : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Code2 className="h-4 w-4" /> Code Snippets
        </button>

        <button
          onClick={() => setActiveTab("lookup")}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "lookup"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/20"
              : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Search className="h-4 w-4" /> Beneficiary Eligibility Check
        </button>

        <button
          onClick={() => setActiveTab("docs")}
          className={`px-4 py-2.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "docs"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/20"
              : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <FileText className="h-4 w-4" /> OAS 3.0 Specification
        </button>
      </div>

      {/* TAB 1: API TESTER PLAYGROUND */}
      {activeTab === "playground" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: REQUEST CONFIG & PAYLOAD (7 COLS) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Endpoint Bar */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black rounded-lg">
                  POST
                </span>
                <span className="text-xs font-mono font-bold text-slate-200 truncate">
                  https://apisetu.gov.in/certificate/v3/pmjay
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExecuteApiCall}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" /> Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-slate-950" /> Execute Request
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Presets */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Quick Test Scenarios / Presets:
              </span>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <button
                  onClick={() => handleSelectPreset("default_pdf")}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    selectedPreset === "default_pdf"
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  ✅ Valid Beneficiary (PDF e-Card)
                </button>

                <button
                  onClick={() => handleSelectPreset("valid_json")}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    selectedPreset === "valid_json"
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  ✅ JSON Format Output
                </button>

                <button
                  onClick={() => handleSelectPreset("valid_xml")}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    selectedPreset === "valid_xml"
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  ✅ XML Format Output
                </button>

                <button
                  onClick={() => handleSelectPreset("err_400_missing_param")}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    selectedPreset === "err_400_missing_param"
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  ⚠️ Test 400 Bad Request
                </button>

                <button
                  onClick={() => handleSelectPreset("err_401_unauthorized")}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    selectedPreset === "err_401_unauthorized"
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  🔒 Test 401 Unauthorized
                </button>

                <button
                  onClick={() => handleSelectPreset("err_404_not_found")}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    selectedPreset === "err_404_not_found"
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  ❌ Test 404 No Record
                </button>
              </div>
            </div>

            {/* Headers Config */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-orange-400" /> Authentication & Request Headers
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                    X-APIKey (API Setu Token)
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                    X-Client-Secret
                  </label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Request Body JSON Editor */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <FileCodeIcon className="h-3.5 w-3.5 text-emerald-400" /> Request Body (application/json)
                </h4>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectPreset("default_pdf")}
                    className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                </div>
              </div>

              <textarea
                value={requestBodyJson}
                onChange={(e) => setRequestBodyJson(e.target.value)}
                rows={16}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400 leading-relaxed focus:outline-none focus:border-emerald-500/50 custom-scrollbar"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: RESPONSE INSPECTOR & e-CARD PREVIEW (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            {/* RESPONSE METRICS BAR */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
                  HTTP Status
                </span>
                {responseStatus !== null ? (
                  <span className={`text-sm font-black px-2.5 py-0.5 rounded border inline-block mt-1 ${
                    responseStatus === 200
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : responseStatus === 400
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : responseStatus === 401
                      ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                      : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  }`}>
                    {responseStatus} {responseStatus === 200 ? "OK" : responseStatus === 400 ? "Bad Request" : responseStatus === 401 ? "Unauthorized" : responseStatus === 404 ? "Record Not Found" : "Error"}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-500 mt-1 block">Awaiting Execution...</span>
                )}
              </div>

              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
                  Latency
                </span>
                <span className="text-xs font-mono font-bold text-slate-200 mt-1 block">
                  {executionTimeMs !== null ? `${executionTimeMs} ms` : "—"}
                </span>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
                  Provider
                </span>
                <span className="text-xs font-bold text-orange-400 mt-1 block">
                  NHA Delhi
                </span>
              </div>
            </div>

            {/* RENDERED E-CARD VISUAL PREVIEW (If 200 OK) */}
            {responseStatus === 200 && responseData && (
              <div className="bg-gradient-to-b from-slate-900 to-emerald-950/40 border-2 border-emerald-500/40 p-5 rounded-2xl space-y-4 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                      <FileCheck2 className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        PM-JAY e-Card Verified
                      </h4>
                      <p className="text-[9px] text-emerald-400 font-mono">
                        DigiLocker Issued Document • Delhi NHA
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase rounded">
                    Active Beneficiary
                  </span>
                </div>

                {/* AYUSHMAN BHARAT CARD GRAPHIC */}
                <div className="bg-gradient-to-r from-orange-600 via-emerald-700 to-teal-800 p-4 rounded-xl text-white space-y-3 shadow-lg relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">
                        Government of India • Ayushman Bharat
                      </span>
                      <h3 className="text-sm font-black mt-1">PM-JAY GOLDEN CARD</h3>
                    </div>
                    <ShieldCheck className="h-7 w-7 text-amber-300 shrink-0" />
                  </div>

                  <div className="pt-1 grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="opacity-75 block text-[8px] uppercase">Beneficiary Name</span>
                      <span className="font-extrabold text-xs">{responseData?.certificateData?.beneficiaryName || "Sita Sharma"}</span>
                    </div>

                    <div>
                      <span className="opacity-75 block text-[8px] uppercase">PM-JAY ID</span>
                      <span className="font-mono font-bold">{responseData?.certificateData?.pmjayId || "PMJAY0000"}</span>
                    </div>

                    <div>
                      <span className="opacity-75 block text-[8px] uppercase">Annual Cover</span>
                      <span className="font-black text-amber-300 text-xs">₹ 5,00,000 / Year</span>
                    </div>

                    <div>
                      <span className="opacity-75 block text-[8px] uppercase">Aadhaar Linked</span>
                      <span className="font-mono">XXXXXXXX1234</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/20 flex justify-between items-center text-[8px]">
                    <span>Issued via API Setu v3.0.0</span>
                    <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded">Verified DigiLocker</span>
                  </div>
                </div>

                {/* Additional Metadata */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-300 text-[10px]">
                    <span className="text-slate-400">State / Authority:</span>
                    <span className="font-bold">{responseData?.certificateData?.state || "NCT Delhi"}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 text-[10px]">
                    <span className="text-slate-400">Empanelled Coverage:</span>
                    <span className="font-bold text-emerald-400">100% Secondary & Tertiary Care</span>
                  </div>
                  <div className="flex justify-between text-slate-300 text-[10px]">
                    <span className="text-slate-400">PDF Document Token:</span>
                    <span className="font-mono text-slate-400 truncate max-w-[180px]">
                      {responseData?.certificateData?.pdfToken || "pdf_pmjay_sec_99812"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert("Downloading official PM-JAY e-Card PDF...")}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Download e-Card PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-all cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* RAW RESPONSE DATA INSPECTOR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-amber-400" /> Response Payload Inspector
                </h4>

                {responseData && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(typeof responseData === "object" ? JSON.stringify(responseData, null, 2) : responseData);
                      alert("Copied response payload!");
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-all cursor-pointer"
                  >
                    <Copy className="h-3 w-3" /> Copy Payload
                  </button>
                )}
              </div>

              {responseData ? (
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-amber-300 leading-relaxed max-h-[320px] overflow-y-auto custom-scrollbar">
                  {typeof responseData === "object" ? JSON.stringify(responseData, null, 2) : responseData}
                </pre>
              ) : (
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-8 text-center space-y-2">
                  <Play className="h-8 w-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-400">No response payload yet.</p>
                  <p className="text-[10px] text-slate-500">
                    Click "Execute Request" above to dispatch the POST request to <code className="text-orange-400">/pmjay</code>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CODE SNIPPETS */}
      {activeTab === "snippets" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Code2 className="h-4 w-4 text-orange-400" /> Multi-Language Integration Snippets
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Copy ready-to-use code snippets for embedding the PM-JAY API Setu endpoint in your production services.
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
            >
              {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedCode ? "Copied!" : "Copy Snippet"}
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            {(["javascript", "curl", "python", "node", "java"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedLanguage === lang
                    ? "bg-slate-800 text-orange-400 border border-orange-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto custom-scrollbar">
            {getCodeSnippet()}
          </pre>
        </div>
      )}

      {/* TAB 3: BENEFICIARY ELIGIBILITY & LOOKUP */}
      {activeTab === "lookup" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Search className="h-4 w-4 text-emerald-400" /> Beneficiary PM-JAY Card Eligibility Lookup
            </h3>
            <p className="text-xs text-slate-400">
              Instant verification tool for hospitals and doctors to check Ayushman Bharat coverage before medical admissions.
            </p>
          </div>

          <div className="flex items-center gap-3 max-w-xl">
            <input
              type="text"
              value={searchPmjayId}
              onChange={(e) => setSearchPmjayId(e.target.value)}
              placeholder="Enter PM-JAY ID or Aadhaar Number (e.g. PMJAY0000)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleExecuteApiCall}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer shrink-0"
            >
              Verify Eligibility
            </button>
          </div>

          {/* Sample Active Beneficiary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  PMJAY0000
                </span>
                <span className="text-[9px] font-bold text-slate-400">Delhi NCT</span>
              </div>
              <h5 className="text-xs font-black text-white">Sita Sharma</h5>
              <p className="text-[10px] text-slate-400">Cover: ₹5,00,000 / Year • 100% Empanelled</p>
              <button
                onClick={() => {
                  setSearchPmjayId("PMJAY0000");
                  handleSelectPreset("default_pdf");
                }}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold rounded-xl border border-slate-800 transition-all cursor-pointer mt-2"
              >
                Load Payload & Test
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  PMJAY884920
                </span>
                <span className="text-[9px] font-bold text-slate-400">UP Central</span>
              </div>
              <h5 className="text-xs font-black text-white">Rajesh Patel</h5>
              <p className="text-[10px] text-slate-400">Cover: ₹5,00,000 / Year • Secondary Care</p>
              <button
                onClick={() => {
                  setSearchPmjayId("PMJAY884920");
                  handleSelectPreset("valid_json");
                }}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold rounded-xl border border-slate-800 transition-all cursor-pointer mt-2"
              >
                Load Payload & Test
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  PMJAY102938
                </span>
                <span className="text-[9px] font-bold text-slate-400">Haryana</span>
              </div>
              <h5 className="text-xs font-black text-white">Ananya Verma</h5>
              <p className="text-[10px] text-slate-400">Cover: ₹5,00,000 / Year • Tertiary Care</p>
              <button
                onClick={() => {
                  setSearchPmjayId("PMJAY102938");
                  handleSelectPreset("valid_xml");
                }}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold rounded-xl border border-slate-800 transition-all cursor-pointer mt-2"
              >
                Load Payload & Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OAS 3.0 SPECIFICATION DOCUMENTATION */}
      {activeTab === "docs" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-400" /> OpenAPI 3.0 (OAS 3.0) Endpoint Reference
            </h3>
            <p className="text-slate-400">
              Complete specification for <code className="text-orange-400">POST /pmjay</code> under API Setu Pradhan Mantri Jan Arogya Yojana, Delhi (v3.0.0).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <h5 className="font-black text-emerald-400 uppercase text-[10px] tracking-wider">
                Response Code 200 (Success)
              </h5>
              <p className="text-slate-300 text-[11px] leading-normal">
                The certificate data in response body in PDF, XML or JSON format as requested in the <code className="text-orange-400">format</code> parameter.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <h5 className="font-black text-amber-400 uppercase text-[10px] tracking-wider">
                Response Code 400 (Bad Request)
              </h5>
              <p className="text-slate-300 text-[11px] leading-normal">
                Returned when mandatory parameters (e.g. <code className="text-orange-400">UDF1</code> or <code className="text-orange-400">consentArtifact</code>) are missing.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <h5 className="font-black text-rose-400 uppercase text-[10px] tracking-wider">
                Response Code 401 (Unauthorized)
              </h5>
              <p className="text-slate-300 text-[11px] leading-normal">
                Authentication failed or invalid API Setu token.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <h5 className="font-black text-purple-400 uppercase text-[10px] tracking-wider">
                Response Code 404 (Record Not Found)
              </h5>
              <p className="text-slate-300 text-[11px] leading-normal">
                No beneficiary record found matching the specified PMJAY UDF parameters.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function FileCodeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a1 1 0 0 0 1 1h4" />
      <path d="m10 13-2 2 2 2" />
      <path d="m14 13 2 2-2 2" />
    </svg>
  );
}
