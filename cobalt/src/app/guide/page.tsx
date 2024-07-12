"use client";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import fetchDirectoryContents from "@/helpers/github/gitApi";
import axios from "axios";
import React, { useEffect, useState } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import jsPDF from "jspdf";
import SnippetComponent from "./SnippetComponent";
import { FaFileDownload } from "react-icons/fa";

import { useRef } from "react";
import RingLoader from "react-spinners/RingLoader";
import { ScrollArea } from "@/components/ui/scroll-area";
import GetUser from "@/helpers/GetUser";

const InvalidFiles = [
  "mp3",
  "mp4",
  "gif",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "webp",
  "class",
  "exe",
];

function Page() {
  const [user, setUser] = useState<object>();
  const LoadUser = async () => {
    await GetUser().then((user) => {
      setUser(user);
    });
  };
  const [initLoading, setInitLoading] = useState<Boolean>(false);

  const [output, setOutput] = useState("");
  const initialize = async (userId) => {
    setInitLoading(true);
    try {
      await axios
        .post(!process.env.SERVER_DOMAIN+"/init", { userId: userId })
        .then((res) => {
          console.log(res);
        });
    } catch (error) {}
    setInitLoading(false);
  };

  useEffect(() => {
    if (user != null) {
      initialize(user._id);
    }
  }, [user]);

  useEffect(() => {
    LoadUser();
  }, []);

  const [command, setCommand] = useState("");

  const PostData = async () => {
    if (command == "") {
      return;
    }
    try {
      console.log(true);
      await axios
        .post(!process.env.SERVER_DOMAIN+"/execute", {
          command: command,
          userId: user._id,
        })
        .then((res) => {
          setOutput(res.data.output);
        });
    } catch (error) {}
  };
  const [directoryBox, setDirectoryBox] = useState(false);
  const [sideBox, setSideBox] = useState<String>("EXPLAIN");
  const [repoLink, setRepoLink] = useState<string>("");
  const [data, setData] = useState<object>();
  const [repoName, setRepoName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [repLoading, setRepoLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>();
  const [explainations, setExplainations] = useState<object>();
  const [optimizations, setOptimizations] = useState<object>();
  const [detections, setDetections] = useState<object>();
  const [expLoading, setExpLoading] = useState(false);
  const [detLoading, setDetLoading] = useState(false);
  const [optLoading, setOptLoading] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const textref = useRef(null);

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      const selectedText = selection.toString();
      setSelectedText(selectedText);
      const range = selection.getRangeAt(0).getBoundingClientRect();
      const { top, left } = range;
      if (textref.current)
        setButtonPosition({
          x: textref.current.selectionEnd,
          y: textref.current.selectionStart,
        });
    }
  };

  useEffect(() => {
    if (selectedFile != null) {
      if (hasREADME(selectedFile)) {
        if (explainations) {
          if (Object.keys(explainations).includes(selectedFile)) {
          } else {
            PromptGemini("EXPLAINREADME");
          }
        } else {
          PromptGemini("EXPLAINREADME");
        }
        if (optimizations) {
          if (Object.keys(optimizations).includes(selectedFile)) {
          } else {
            PromptGemini("OPTIMIZEREADME");
          }
        } else {
          PromptGemini("OPTIMIZEREADME");
        }
      } else {
        if (explainations) {
          if (Object.keys(explainations).includes(selectedFile)) {
          } else {
            PromptGemini("EXPLAINCODE");
          }
        } else {
          PromptGemini("EXPLAINCODE");
        }
        if (optimizations) {
          if (Object.keys(optimizations).includes(selectedFile)) {
          } else {
            PromptGemini("OPTIMIZECODE");
          }
        } else {
          PromptGemini("OPTIMIZECODE");
        }
        if (detections) {
          if (Object.keys(detections).includes(selectedFile)) {
          } else {
            PromptGemini("DETECTCODE");
          }
        } else {
          PromptGemini("DETECTCODE");
        }
      }
    }
  }, [selectedFile]);

  useEffect(() => {
    if (repoLink.startsWith("https://")) {
      setRepoLink(repoLink.replace("https://", ""));
    }
    setUserName(repoLink.split("/")[1]);
    setRepoName(repoLink.split("/")[2]);
  }, [repoLink]);

  const [sensitiveFiles, setSensitiveFiles] = useState([]);
  const sensitivePatterns = [
    "api_key",
    "password",
    "secret_key",
    "access_token",
    "auth_token",
    "oauth_token",
    "token",
    "private_key",
    "client_secret",
    "encryption_key",
    "api_secret",
    "session_token",
    "refresh_token",
    "jwt_token",
    "rsa_private_key",
    "dsa_private_key",
    "ecdsa_private_key",
    "x509_certificate",
    "pem_key",
    "oauth_consumer_secret",
    "database_password",
    "ftp_password",
    "ssh_private_key",
    "ssl_certificate",
    "paypal_secret",
    "bearer_token",
    "session_id",
    "client_certificate",
    "api_token",
    "encryption_key",
    "api_secret_key",
    "app_secret",
    "app_token",
    "admin_password",
    "root_password",
    "server_key",
    "service_account_key",
    "AWS_access_key",
    "AWS_secret_key",
    "azure_storage_key",
    "azure_client_secret",
    "azure_cosmos_key",
    "azure_search_key",
    "database_username",
    "database_connection_string",
    "database_encryption_key",
    "database_master_password",
    "email_password",
    "smtp_credentials",
    "imap_credentials",
    "ldap_credentials",
    "sftp_password",
    "ftp_credentials",
    "vpn_password",
    "wifi_password",
    "keystore_password",
    "truststore_password",
    "ssl_keystore_password",
    "ssl_truststore_password",
    "git_credentials",
    // Add more sensitive patterns to reach a total of 100
    "instagram_token",
    "twitter_token",
    "facebook_token",
    "linkedin_token",
    "google_token",
    "microsoft_token",
    "yahoo_token",
    "twitch_token",
    "reddit_token",
    "discord_token",
    "slack_token",
    "zoom_token",
    "tiktok_token",
    "snapchat_token",
    "spotify_token",
    "amazon_token",
    "alibaba_token",
    "ebay_token",
    "paypal_token",
    "netflix_token",
    "github_token",
    "gitlab_token",
    "bitbucket_token",
    "docker_token",
    "kubernetes_token",
    "firebase_token",
    "apple_token",
    "android_token",
    "microsoft_office_token",
    "adobe_token",
    "salesforce_token",
    "zendesk_token",
    "jira_token",
    "wordpress_token",
    "shopify_token",
    "bigcommerce_token",
    "woocommerce_token",
    "squarespace_token",
    "wix_token",
    "weebly_token",
    "godaddy_token",
    "bluehost_token",
    "hostgator_token",
    "namecheap_token",
    "digitalocean_token",
    "linode_token",
    "aws_ec2_token",
    "google_cloud_token",
    "azure_vm_token",
    "heroku_token",
    "slack_webhook",
    "twilio_auth_token",
    "sendgrid_api_key",
    "stripe_secret_key",
    "paypal_client_secret",
    "coinbase_api_secret",
  ];

  const scanRepository = async () => {
    Object.keys(data).forEach((key) => {
      const fileContent = data[key];
      Object.keys(sensitivePatterns).forEach((key1) => {
        if (fileContent.indexOf(sensitivePatterns[key1]) > -1) {
          setSensitiveFiles([...sensitiveFiles, key]);
        }
      });
    });
  };

  useEffect(() => {
    console.log(sensitiveFiles);
  }, [sensitiveFiles]);

  const downloadPDF = (content) => {
    const doc = new jsPDF();

    const margin = 10;
    const pageHeight = doc.internal.pageSize.height - 2 * margin;

    const lines = doc.splitTextToSize(
      content,
      doc.internal.pageSize.width - 2 * margin
    );

    let y = margin;
    let currentPage = 1;
    lines.forEach((line, index) => {
      if (y > pageHeight) {
        doc.addPage();
        currentPage++;
        y = margin;
      }
      doc.text(margin, y, line);
      y += doc.getTextDimensions(line).h + 5;
    });

    const pdfContent = doc.output();

    const blob = new Blob([pdfContent], { type: "application/pdf" });

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "content.pdf";
    link.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(link.href);
      link.remove();
    }, 100);
  };

  const GetRepo = async () => {
    setSensitiveFiles([]);
    if (repoLink == null || repoLink == "") {
      return;
    }
    setRepoLoading(true);
    const d = localStorage.getItem(`${userName}/${repoName}`);

    if (d == null) {
      try {
        await fetchDirectoryContents(userName, repoName).then((data) => {
          if (data == null) {
            console.log("Cannot fetch");
          } else {
            setData(data);
            localStorage.setItem(
              `${userName}/${repoName}`,
              JSON.stringify(data)
            );
            Object.keys(data).forEach((key) => {
              if (hasREADME(key)) {
                setSelectedFile(key);
              }
            });
          }
        });
      } catch (error) {}
    } else {
      setData(JSON.parse(d));
    }
    setRepoLoading(false);
    const opt = localStorage.getItem(`OPT_${userName}/${repoName}`);
    const exp = localStorage.getItem(`EXP_${userName}/${repoName}`);
    const det = localStorage.getItem(`DET_${userName}/${repoName}`);

    if (opt) {
      setOptimizations(JSON.parse(opt));
    }
    if (exp) {
      setExplainations(JSON.parse(exp));
    }
    if (det) {
      setDetections(JSON.parse(det));
    }
  };

  useEffect(() => {
    if (data) scanRepository();
  }, [data]);

  const DownloadiNEnv = async () => {
    if (repoName == "" || userName == "") {
      return;
    }
    await axios.post(!process.env.SERVER_DOMAIN+"/up", {
      userId: user._id,
      repoName,
      userName,
    });
  };

  function hasREADME(string: string) {
    const regex = /README\.md/i;
    return regex.test(string);
  }

  useEffect(() => {
    if (explainations) {
      localStorage.setItem(
        `EXP_${userName}/${repoName}`,
        JSON.stringify(explainations)
      );
    }
  }, [explainations]);
  useEffect(() => {
    if (detections) {
      localStorage.setItem(
        `DET_${userName}/${repoName}`,
        JSON.stringify(detections)
      );
    }
  }, [detections]);

  useEffect(() => {
    if (optimizations) {
      localStorage.setItem(
        `OPT_${userName}/${repoName}`,
        JSON.stringify(optimizations)
      );
    }
  }, [optimizations]);

  const PromptGemini = async (type: String) => {
    let Prompt = "";

    if (type == "EXPLAINREADME") {
      setExpLoading(true);
      Prompt =
        "Analyze the given README.md file and provide a comprehensive explanation of the project it describes. Include details about the project's purpose, functionalities, installation instructions, usage steps, and any relevant contributing guidelines. Additionally, identify any links or references mentioned in the Readme that could be helpful for further exploration " +
        data[selectedFile];
    }
    if (type == "EXPLAINCODE") {
      setExpLoading(true);
      Prompt =
        "Analyze the code in <selected file> and provide detailed explanations for each function defined within the file. Explain the purpose of each function, its parameters, return values (if any), and the logic it implements. Additionally, identify any internal function calls or dependencies between functions." +
        data[selectedFile];
    }

    if (type == "OPTIMIZECODE") {
      setOptLoading(true);
      Prompt =
        "Optimize the code in the provided file to enhance its efficiency and performance. Identify areas where the code can be improved, such as through algorithmic enhancements, streamlined logic, or resource management. Focus on reducing redundant operations, minimizing memory usage, and improving overall runtime. Your goal is to generate a revised version of the code that maintains its functionality while achieving higher levels of optimization. Ensure that the optimized code maintains readability and clarity, facilitating easy comprehension and future maintenance." +
        data[selectedFile];
    }

    if (type == "OPTIMIZEREADME") {
      setOptLoading(true);
      Prompt = "Optimize the Readme" + data[selectedFile];
    }
    if (type == "PDFCONTENT") {
    }
    if (type == "EXPLAINSNIPPET") {
    }
    if (type == "DETECTCODE") {
      setDetLoading(true);
      Prompt =
        "Filter out the functions and modules utilized in the provided code, adding a concise one-line comment before each function to elucidate its purpose, ensuring the response is presented cleanly without any highlighting." +
        data[selectedFile];
    }

    try {
      await axios
        .post("api/users/askgeminitext", { prompt: Prompt })
        .then((res) => {
          if (type == "EXPLAINREADME") {
            Object.keys(data).forEach((key) => {
              if (key == selectedFile) {
                setExplainations({ ...explainations, [key]: res.data.message });
              }
            });
            setExpLoading(false);
          }
          if (type == "EXPLAINCODE") {
            Object.keys(data).forEach((key) => {
              if (key == selectedFile) {
                setExplainations({ ...explainations, [key]: res.data.message });
              }
            });
            setExpLoading(false);
          }

          if (type == "OPTIMIZECODE") {
            Object.keys(data).forEach((key) => {
              if (key == selectedFile) {
                setOptimizations({ ...optimizations, [key]: res.data.message });
              }
            });
            setOptLoading(false);
          }

          if (type == "OPTIMIZEREADME") {
            Object.keys(data).forEach((key) => {
              if (key == selectedFile) {
                setOptimizations({ ...optimizations, [key]: res.data.message });
              }
            });
            setOptLoading(false);
          }
          if (type == "PDFCONTENT") {
          }
          if (type == "EXPLAINSNIPPET") {
          }
          if (type == "DETECTCODE") {
            Object.keys(data).forEach((key) => {
              if (key == selectedFile) {
                console.log(true);
                setDetections({ ...detections, [key]: res.data.message });
                setDetLoading(false);
              }
            });
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="h-screen flex flex-col">
        <NavBar />
        <div className="p-4 flex gap-2">
          <input
            type="text"
            value={repoLink}
            onChange={(e) => {
              setRepoLink(e.target.value);
            }}
            name=""
            id=""
            className=" px-4 py-2 pr-4 h-10 min-w-[400px] bg-[#1e293b] rounded-md text-[#8f9eb3] focus:outline-none focus:ring focus:ring-opacity-60"
          />
          {repLoading ? (
            <>
              <Button
                disabled
                variant="anibutton"
                className="h-10 min-w-[100px] text-md font-semibold"
                onClick={(e) => {
                  e.preventDefault();
                  setData(null);
                  GetRepo();
                }}
              >
                <span className="relative z-10">Loading...</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="anibutton"
                className="h-10 min-w-[100px] text-md font-semibold"
                onClick={(e) => {
                  e.preventDefault();
                  setData(null);
                  GetRepo();
                }}
              >
                <span className="relative z-10">Get Repo</span>
              </Button>
            </>
          )}
          <Button
            variant="anibutton"
            className="h-10 min-w-[100px] text-md font-semibold"
            onClick={(e) => {
              e.preventDefault();
              DownloadiNEnv();
            }}
          >
            <span className="relative z-10">Download in env</span>
          </Button>
        </div>

        {/* check */}

        
        <ResizablePanelGroup className="h-full flex" direction={"horizontal"}>
          <ResizablePanel
            defaultSize={15}
            maxSize={15}
            className="bg-[#264F9460]  h-full border"
          >
            <div className=" flex flex-col text-[#b5daff] m-2 gap-2 overflow-y-scroll">
              {data &&
                Object.keys(data).map((key) => {
                  return (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const a = key.split(".")[key.split(".").length - 1];
                        if (
                          !InvalidFiles.includes(a.toLowerCase()) &&
                          !InvalidFiles.includes(a.toUpperCase())
                        ) {
                          setSelectedFile(key);
                        }
                      }}
                      key={key}
                    >
                      {" "}
                      {sensitiveFiles.includes(key) ? (
                        <>
                          <p
                            className={
                              " bg-red-500 text-left pl-3 py-1 rounded-md hover:border"
                            }
                          >
                            {key}
                          </p>{" "}
                        </>
                      ) : (
                        <>
                          <p
                            className={` ${
                              key == selectedFile
                                ? " bg-blue-500 "
                                : " bg-[#40506a] "
                            } text-left pl-3 py-1 rounded-md hover:border`}
                          >
                            {key}
                          </p>{" "}
                        </>
                      )}
                    </button>
                  );
                })}
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <ResizablePanelGroup direction={"vertical"}>
              <ResizablePanel>
                <ResizablePanelGroup direction={"horizontal"}>
                  <ResizablePanel minSize={30}>
                    <div className="bg-[#264F9460] h-full border text-white ">
                      {data &&
                        Object.keys(data).map((key) => {
                          if (key == selectedFile)
                            return (
                              <CodeEditor
                                autoFocus
                                ref={textref}
                                autoComplete="off"
                                value={data[selectedFile]}
                                language={selectedFile.split(".")[1]}
                                className="w-[100%] h-[100%] border backdrop-blur-xl overflow-y-scroll border-black rounded-md"
                                spellCheck={false}
                                onMouseUp={handleSelection}
                                onMouseDown={() => {
                                  setSelectedText(null);
                                }}
                                key={key}
                                style={{ overflow: "scroll" }}
                              >
                                {" "}
                                {data[key]}{" "}
                              </CodeEditor>
                            );
                        })}
                      {selectedText && (
                        <div
                          className=""
                          style={{
                            position: "absolute",
                            top: buttonPosition.y,
                            left: buttonPosition.x,
                          }}
                        >
                          <Button
                            className=" w-20 p-1"
                            variant="snipbutton"
                            onClick={() => {
                              setSideBox("SAVE");
                            }}
                          >
                            Snip
                          </Button>
                       
                        </div>
                      )}
                    </div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel minSize={30}>
                    <div className="bg-[#264F9460] h-full text-white overflow-y-auto custom-scrollbar border">
                      <ul className="flex text-center gap-1 p-1">
                        <li
                          onClick={() => {
                            setSideBox("EXPLAIN");
                          }}
                          className="bg-blue-500 w-[25%] hover:bg-slate-500 rounded-md p-2"
                          style={{
                            backgroundColor:
                              sideBox == "EXPLAIN"
                                ? "rgb(59 130 246)"
                                : "rgb(100 116 139)",
                          }}
                        >
                          Explanation
                        </li>
                        <li
                          onClick={() => {
                            setSideBox("SAVE");
                          }}
                          className="bg-slate-500 rounded-md hover:bg-slate-800 w-[25%]  p-2"
                          style={{
                            backgroundColor:
                              sideBox == "SAVE"
                                ? "rgb(59 130 246)"
                                : "rgb(100 116 139)",
                          }}
                        >
                          Snippet
                        </li>
                        <li
                          onClick={() => {
                            setSideBox("MODEL");
                          }}
                          className="bg-slate-500 rounded-md hover:bg-slate-800 w-[25%] p-2"
                          style={{
                            backgroundColor:
                              sideBox == "MODEL"
                                ? "rgb(59 130 246)"
                                : "rgb(100 116 139)",
                          }}
                        >
                          components
                        </li>
                        <li
                          onClick={() => {
                            setSideBox("OPTIMIZE");
                          }}
                          className="bg-slate-500 rounded-md hover:bg-slate-800 w-[25%] p-2"
                          style={{
                            backgroundColor:
                              sideBox == "OPTIMIZE"
                                ? "rgb(59 130 246)"
                                : "rgb(100 116 139)",
                          }}
                        >
                          optimization
                        </li>
                      </ul>
                      <hr />

                      <div>
                        {sideBox == "EXPLAIN" && (
                          <>
                            {expLoading ? (
                              <>
                                <div className="flex h-[100%] justify-center items-center pt-[250px]">
                                  <RingLoader color="#3b81f6" size={100} />
                                </div>
                              </>
                            ) : (
                              <>
                                {explainations &&
                                  Object.keys(explainations).map((key) => {
                                    if (key == selectedFile) {
                                      return (
                                        <div key={key} className="p-4">
                                          <pre
                                            className="whitespace-pre-wrap font-sans"
                                            key={key}
                                          >
                                            {explainations[key]}{" "}
                                          </pre>
                                          <div className="w-12 h-12 rounded-full border border-white fixed bottom-7 right-7 flex justify-center items-center hover:bg-blue-500">
                                            <button
                                              className="text-white"
                                              onClick={() =>
                                                downloadPDF(optimizations[key])
                                              }
                                            >
                                              <FaFileDownload className="w-7 h-7" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    }
                                  })}
                              </>
                            )}
                          </>
                        )}
                        {sideBox == "MODEL" && (
                          <>
                            {detLoading ? (
                              <>
                                <div className="flex h-[100%] justify-center items-center pt-[250px]">
                                  <RingLoader color="#3b81f6" size={100} />
                                </div>
                              </>
                            ) : (
                              <>
                                {detections &&
                                  Object.keys(detections).map((key) => {
                                    if (key == selectedFile) {
                                      return (
                                        <div key={key} className="p-4">
                                          <pre
                                            className="whitespace-pre-wrap font-sans"
                                            key={key}
                                          >
                                            {detections[key]}{" "}
                                          </pre>
                                          <div className="w-12 h-12 rounded-full border border-white fixed bottom-7 right-7 flex justify-center items-center hover:bg-blue-500">
                                            <button
                                              className="text-white"
                                              onClick={() =>
                                                downloadPDF(optimizations[key])
                                              }
                                            >
                                              <FaFileDownload className="w-7 h-7" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    }
                                  })}
                              </>
                            )}
                          </>
                        )}
                        {sideBox == "SAVE" && (
                          <>
                            <SnippetComponent
                              code={selectedText}
                              getHubLink={repoLink}
                            />
                          </>
                        )}
                        {sideBox == "OPTIMIZE" && (
                          <>
                            {optLoading ? (
                              <div className="flex h-[100%] justify-center items-center pt-[250px]">
                                <RingLoader color="#3b81f6" size={100} />
                              </div>
                            ) : (
                              <>
                                {optimizations &&
                                  Object.keys(optimizations).map((key) => {
                                    if (key == selectedFile) {
                                      return (
                                        <div key={key} className="p-4">
                                          <pre
                                            className="whitespace-pre-wrap font-sans"
                                            key={key}
                                          >
                                            {optimizations[key]}{" "}
                                          </pre>
                                          <div className="w-12 h-12 rounded-full border border-white fixed bottom-7 right-7 flex justify-center items-center hover:bg-blue-500">
                                            <button
                                              className="text-white"
                                              onClick={() =>
                                                downloadPDF(optimizations[key])
                                              }
                                            >
                                              <FaFileDownload className="w-7 h-7" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    }
                                  })}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              <ResizableHandle />
              <ResizablePanel defaultSize={15} minSize={10} maxSize={40}>
                <div className="bg-black  text-white h-full">
                  <div>
                    {user && <>@/{user._id} / </>}
                    <input
                      type="text"
                      className="text-white bg-black"
                      onKeyDown={(e) => {
                        if (e.key == "Enter") {
                          PostData();
                        }
                      }}
                      onChange={(e) => {
                        setCommand(e.target.value);
                      }}
                      name=""
                      id=""
                    />
                    <button
                      className=""
                      onClick={(e) => {
                        e.preventDefault();
                        PostData();
                      }}
                    >
                      {" "}
                      execute{" "}
                    </button>
                    <br />
                    {output}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}

export default Page;
