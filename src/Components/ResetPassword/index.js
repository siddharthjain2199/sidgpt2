import { useContext, useReducer, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../Context/userContext";
import { initialState, userReducer } from "../../data/reducers/userReducer";
import { handleForgotPassword } from "../../Libs/firebaseutils";

function ResetPassword() {

  const [loginEmail, setLoginEmail] = useState({ email: '' });
  const [state, dispatch] = useReducer(userReducer, initialState);

  const handleEmail = (e) => setLoginEmail({ ...loginEmail, email: e.target.value })
  const { currentUser } = useContext(AuthContext);

  function handleSubmit(event) {
    event.preventDefault();
    handleForgotPassword(loginEmail.email,dispatch);
  }

  return (
    <div>
    {currentUser ? (
        <>
            <Navigate to="/" />
        </>
    ) : (
        <>
    <section className='container mx-auto p-5 fixed inset-0 mt-3'>
      <div className="mockup-window bg-base-300 w-full h-full flex flex-col">
        <div className="p-5 pb-8 flex-grow overflow-auto">
          {state.error && <>
            <div className='alert alert-info text-light alert-dismissible fade show'>
               {state.error}
            </div>
            <br></br>
          </>}
          <div className="container bg-transparent text-light">
            <h2 className='text-center mb-3'>Reset Password</h2>
            <hr />
            <form onSubmit={handleSubmit} className="text-light">
              <div className="form-group row">
                <label className="col-sm-2 col-form-label">
                  Email:
                </label>
                <div className='col-sm-5'>
                  <input type="email" className='form-control bg-transparent text-light' value={loginEmail.email} onChange={handleEmail} required/>
                </div>
              </div>

              <div className="form-group mt-3">
                <button className='btn btn-warning' type="submit">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
    </>

)}
</div>
  )
}

export default ResetPassword;