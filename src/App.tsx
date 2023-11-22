import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Profile from "./routes/profile";
import Home from "./routes/home";
import Layout from "./components/layout";
import Login from "./routes/login";
import CreateAccount from "./routes/create-account";
import styled, { createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/loading-screen";
import { auth } from "./routes/firebase";
import ProtectedRoute from "./components/protected-route";


const router = createBrowserRouter([
  {
    path:'/',
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "/profile",
        element: <Profile />
      },
    ],
  },
    { 
      path: "/login",
      element: <Login />, 
    },
    {
      path: "/createAccount",
      element:  <CreateAccount />,
    }
]);

const GlobalStyles = createGlobalStyle`
  ${reset};
  *{
    box-sizing: border-box;
  }
  body{
    background-color: black;
    color: white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'segoe UI',
    Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', Helevetica Neue',
    sans-serif;
  }
`;
const Wrapper = styled.div`
width: 100%;
display: flex;
justify-content: center;
`;

function App() { 
  const [ isLoading, setIsLoading] = useState(true);
  const init = async() =>{
    await auth.authStateReady();
    setTimeout(() => setIsLoading(false), 2000)
    
  };
  useEffect(()=>{
    init();
  }, []);

  return (
  <Wrapper>
  <GlobalStyles/>
  {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
  </Wrapper>
  );
}

export default App
