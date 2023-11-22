import {useState} from "react"
import styled from "styled-components"

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const TextArea = styled.textarea`
    border: 2px solid white;
    padding: 20px;
    border-radius: 20px;
    font-size: 16px;
    color:  white;
    background-color: black;
    width: 100%;
    resize: none;
    &::placeholder{
        font-size: 16px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    &:focus{
        outline: none;
        border-color: #1d9bf0;
    }
`;

const AttachFileButton = styled.label`
    padding: 10px 0;
    color: #1d9bf0;
    text-align: center;
    border-radius: 20px;
    border: 1px solid #1d9bf0;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
`;

const AttachFileInput = styled.input`
    display: none;
`;

const SubmitBtn = styled.input`
    background-color: #1d9bf0;
    color: white;
    border: none;
    padding: 10px 0;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    &:hover, &:active{
        opacity: 0.9;
    }
`;

export default function PostTweetForm(){
    const [inLoading, setLoading] = useState(false);
    const [tweet, setTweet] = useState('');
    const [file, setFile] = useState<File | null> (null);
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTweet(e.target.value);
    };
    const


    return(
        <Form>
            <TextArea value={tweet} onChange={onChange} placeholder="What is happening?!"/> 
            <AttachFileButton htmlFor="file">Add Photo</AttachFileButton>
            <AttachFileInput type="file" id="file" accept="image/*"/> 
            <SubmitBtn type="submit" value="Post Tweet" />
        </Form>
    )
}