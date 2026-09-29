import { convolve } from "./actions";

export default function HomePage() {
    return (
        <form action={convolve}>
            <div>
                <input type="file" name="file" />
            </div>
            <div>
                <button>Upload</button>
            </div>
        </form>
    );
}
