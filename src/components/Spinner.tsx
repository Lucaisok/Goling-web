import ClipLoader from "react-spinners/ClipLoader";

export default function Spinner() {
    return (
        <div className="spinnerOverlay">
            <ClipLoader
                color={"#ffffff"}
                loading={true}
                size={150}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </div>
    );
}