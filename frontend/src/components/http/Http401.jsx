import React from "react";
import PropTypes from "prop-types";

function renderError(error) {
    if (!error) return null;

    // If it's a valid React element (e.g., HTML or JSX)
    if (React.isValidElement(error)) {
        return error;
    }

    // If it's a string
    if (typeof error === "string") {
        return <div className="alert alert-danger mt-3">{error}</div>;
    }

    // If it's an object, try to display its message or JSON
    if (typeof error === "object") {
        if (error.message) {
            return <div className="alert alert-danger mt-3">{error.message}</div>;
        }
        return (
            <pre className="alert alert-danger mt-3">
                {JSON.stringify(error, null, 2)}
            </pre>
        );
    }

    // Fallback
    return <div className="alert alert-danger mt-3">An unknown error occurred.</div>;
}

const Http401 = ({ error }) => (
    <div className="container py-5">
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
                <div className="card shadow">
                    <div className="card-body text-center">
                        <h1 className="display-4 text-danger">401</h1>
                        <h2 className="mb-3">Unauthorized</h2>
                        <p className="lead">
                            You are not authorized to access this resource.
                        </p>
                        {renderError(error)}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

Http401.propTypes = {
    error: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
        PropTypes.node,
    ]),
};

export default Http401;