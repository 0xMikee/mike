import { useOptionalUser } from "~/utils/misc";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "~/utils/session.server";
import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import { youtubeParser } from "~/utils/youtubeParser";
import homeStyles from "~/styles/css/6_routes/homePage.css";

export const links = () => {
    return [{ rel: "stylesheet", href: homeStyles}];
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request)
  return json({});
};

export default function Index() {
    const inputUrlRef = useRef<any>()
    const [urlResult, setUrlResult] = useState(null)
    const [resultTitle, setResultTitle] = useState("")

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const youtubeID = youtubeParser(inputUrlRef.current?.value);

        const options = {
            method: 'get',
            url: 'https://youtube-mp36.p.rapidapi.com/dl',
            headers: {
                'X-RapidAPI-Key': '8df90b1c2amshe42bc38c51ee9d4p19d05djsn9c83ef70cb4f',
                'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
            },
            params: {
                id: youtubeID
            }
        }
        axios(options)
            .then(res => {
                setUrlResult(res.data.link)
                setResultTitle(res.data.title)
            })
            .catch(err => console.log(err))

        inputUrlRef.current.value = '';

    }

    return (
    <div className="homePage">
        <div className="homePage__youtubeConvertor">
            <form onSubmit={handleSubmit} className="homePage__form">
                <input ref={inputUrlRef} placeholder="Paste a Youtube video URL link..." className="homePage__input" type="text" />
                <button type="submit" className="form_button">Search</button>
            </form>
            {urlResult && <div className="homePage__resultTitle">{resultTitle}</div>}
            {urlResult && <a target='_blank' rel="noreferrer" href={urlResult} className="homePage__resultDownload">Download MP3</a>}
        </div>
    </div>
  );
}
