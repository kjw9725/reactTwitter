import { useState } from "react";
import { auth } from "./firebase";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Error, Form, Input, Switcher, Title, Wrapper } from "../components/auth-components";
import GithubButton from "../components/github-btn";




export default function Login(){
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {target: {name, value} } = e;
        if(name == 'email'){
            setEmail(value);
        }else{
            setPassword(value);
        }
    }
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if(isLoading || email ==='' || password ==='') return;
        try{
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch{
            setError(true);
        }finally {
            setLoading(false);
        }
    };


    return (
        <Wrapper>
            <Title>Log into X</Title>
        <Form onSubmit={onSubmit}> 
            <Input name="email" onChange={onChange} value={email} placeholder="Email" type="email" required />
            <Input name="password" onChange={onChange} value={password} placeholder="Password" type="password" required/>
            <Input type="submit" value={isLoading ? "Loading..." : "Login"}/>
        </Form>
        {error ? <Error>이메일 또는 패스워드가 일치하지않습니다 </Error>: null }
        <Switcher>
            Don't have an account?
            <Link to="/createAccount">Create Account</Link>
        </Switcher>
        <GithubButton />
    </Wrapper>
    )
}