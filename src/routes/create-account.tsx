import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./firebase";  
import { Link } from "react-router-dom"; 
import { Error, Form, Input, Switcher, Title, Wrapper } from "../components/auth-components";
import GithubButton from "../components/github-btn";


export default function CreateAccount(){
    const [isLoading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        const {target: {name, value} } = e;
        if(name == 'name'){
            setName(value);
        }else if(name == 'email'){
            setEmail(value);
        }else{
            setPassword(value);
        }
     }
     const onSubmit = async (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault(); 
        setError('');

        if(isLoading || name === '' || email ==='' || password ==='') return;
        try{
            setLoading(true);
            const credentials = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(credentials.user, {
                displayName: name,
            })
        } catch(e){
            setError(e.message);
        }finally {
            setLoading(false);
        }
     };


    return (
        <Wrapper>
            <Title>Join to X</Title>
        <Form onSubmit={onSubmit}>
            <Input name="name" onChange={onChange} value={name} placeholder="Name" type="text" required />
            <Input name="email" onChange={onChange} value={email} placeholder="Email" type="email" required />
            <Input name="password" onChange={onChange} value={password} placeholder="Password" type="password" required/>
            <Input type="submit" value={isLoading ? "Loading..." : "create Account"}/>
        </Form>
        {error !== "" ? <Error>{error} </Error>: null }
        <Switcher>
            Do you have an account?
            <Link to="/Login">Login</Link>
        </Switcher> 
        <GithubButton />
    </Wrapper>
    )
}