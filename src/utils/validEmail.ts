export default function validEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
}