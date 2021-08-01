import React, { useEffect, useRef,useState } from 'react'
import "./upload.scss";
import icon from "./file.svg";
import axios from "./axios";
import copyIcon from "./copy-icon.svg";
import LinearProgress from "@material-ui/core/LinearProgress";
const Upload = () => {

   
    const [file, setfile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [sharing, showSharing] = useState(true);
    const inputRef = useRef(null);
    const senderInput = useRef(null);
    const receiverInput = useRef(null);

    const shareLinkInputRef = useRef(null);
    
    const fileUpload = async () => {
        console.log("called", file);
         try {
            if (!file) return;

             let formdata = new FormData();
             formdata.append("myfile", file, file.name);
             let resp = await axios.post("/api/files", formdata, {
                onUploadProgress : progressEvent => setProgress(Math.round((progressEvent.loaded / progressEvent.total)*100))
             });
            //  console.log(resp)
             showSharing(true);
             shareLinkInputRef.current.value = resp.data.file;
             setfile(null);
         } catch (error) {
            console.log(error.message) 
         }

    }

    const sendMail = async (e) => {
        e.preventDefault();
        const emailTo = receiverInput.current.value;
        const emailFrom = senderInput.current.value;
        const uuid = shareLinkInputRef.current.value.split("/").reverse()[0];
        const request = { emailFrom, emailTo, uuid };
        // const formData = new FormData();
        // formData.append()
        // console.log(request);

        let response = await axios.post("api/files/send",request);
        console.log(response);
    }

    useEffect(() => {
        console.log(file);
        fileUpload()
    }, [file])

    const dragOverHandler = (e) => {
        e.preventDefault();
        const target = e.target;
        if (!target.classList.contains("dragged")) {
            target.classList.add("dragged")
        }
    }
    const dragLeaveHandler = (e) => {
        const target = e.target;
        console.log("dragging");
        if (target.classList.contains("dragged")) {
            target.classList.remove("dragged")
        }
    }

    const dropHandler = (e) => {
        console.log("dropped")
        e.preventDefault()
        if (e.dataTransfer.files.length) {
            console.log(e.dataTransfer.files);
            setfile(e.dataTransfer.files[0]);
        }
        const target = e.target;

        if (target.classList.contains("dragged")) {
            target.classList.remove("dragged")
        }

        
    }

    return (
        <div className="upload-container">
            <div onDragOver={dragOverHandler} onDragLeave={dragLeaveHandler} onDrop={dropHandler} className="drop-zone">
                <div className="icon-container">
                    <img src={icon} alt="" className="center" draggable={false} />
                    <img src={icon} alt="" className="left" draggable={false} />
                    <img src={icon} alt="" className="right" draggable={false} />

                </div>
               
                <input
                    ref={inputRef}
                    onChange={(e) => { setfile(e.target.files[0]); }}
                    id="fileinput"
                    type="file"
                />

                <div className="title">
                    Drop your files here or, &nbsp;
                    <span onClick={() => { inputRef.current.click() }} className="browseBtn">Browse</span>
                </div>

                {
                    file && <div className="progress-bar" style={{width:"60%",marginTop:"15px"}}>
                    <LinearProgress variant="determinate" value={progress} />
                </div>
                }
            </div>

            {
                sharing && <div className="sharing-container">
                <p className="expire">Link expires in 24 hrs</p>


                <div className="input-container">
                    <input ref={shareLinkInputRef} type="text" id="fileURL" readOnly />
                        <img src={copyIcon} id="copyURLBtn" alt="copy to clipboard icon" onClick={() => {
                            shareLinkInputRef.current.select();
                            document.execCommand("copy");
                    }} />
                </div>
                <p className="email-info">Or Send via Email</p>

                <div className="email-container">
                <form id="emailForm" onSubmit={sendMail}>
                    <div className="filed">
                        <label htmlFor="fromEmail">Your email</label>
                        <input ref={senderInput} type="email" autoComplete="email" required name="from-email" id="fromEmail" />
                    </div>

                    <div className="filed">
                        <label htmlFor="toEmail">Receiver's email</label>
                        <input ref={receiverInput} type="email" required autoComplete="receiver" name="to-email" id="toEmail" />
                    </div>
                    <div className="send-btn-container">
                        <button type="submit">Send</button>
                    </div>
                </form>
            </div>
            </div>
            }
        </div>
    )
}

export default Upload


